// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"sync"
	"time"
)

const oidcFlowTTL = 5 * time.Minute

type oidcFlowData struct {
	code    string
	state   string
	expires time.Time
	once    sync.Once
}

type oidcFlowStore struct {
	mu    sync.Mutex
	flows map[string]*oidcFlowData
}

var globalOIDCFlowStore = &oidcFlowStore{
	flows: make(map[string]*oidcFlowData),
}

// oidcStateStore tracks OIDC state server-side so callback works when cookies
// are dropped (proxy, cross-host API URL, or concurrent prefetch).
type oidcStateStore struct {
	mu     sync.Mutex
	states map[string]time.Time
}

var globalOIDCStateStore = &oidcStateStore{
	states: make(map[string]time.Time),
}

func (s *oidcStateStore) register(state string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.purgeLocked()
	s.states[state] = time.Now().Add(oidcFlowTTL)
}

func (s *oidcStateStore) valid(state string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	exp, ok := s.states[state]
	return ok && time.Now().Before(exp)
}

func (s *oidcStateStore) consume(state string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	exp, ok := s.states[state]
	if !ok || time.Now().After(exp) {
		delete(s.states, state)
		return false
	}
	delete(s.states, state)
	return true
}

func (s *oidcStateStore) purgeLocked() {
	now := time.Now()
	for state, exp := range s.states {
		if now.After(exp) {
			delete(s.states, state)
		}
	}
}

func (s *oidcFlowStore) create(code, state string) (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	flowID := base64.RawURLEncoding.EncodeToString(b)

	s.mu.Lock()
	defer s.mu.Unlock()
	s.purgeExpiredLocked()
	s.flows[flowID] = &oidcFlowData{
		code:    code,
		state:   state,
		expires: time.Now().Add(oidcFlowTTL),
	}
	return flowID, nil
}

func (s *oidcFlowStore) get(flowID string) (*oidcFlowData, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.purgeExpiredLocked()
	data, ok := s.flows[flowID]
	if !ok || time.Now().After(data.expires) {
		delete(s.flows, flowID)
		return nil, false
	}
	return data, true
}

func (s *oidcFlowStore) delete(flowID string) {
	s.mu.Lock()
	delete(s.flows, flowID)
	s.mu.Unlock()
}

func (s *oidcFlowStore) purgeExpiredLocked() {
	now := time.Now()
	for id, data := range s.flows {
		if now.After(data.expires) {
			delete(s.flows, id)
		}
	}
}
