// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package handlers

import (
	"sync"
	"time"
)

const oidcFlowTTL = 5 * time.Minute

type oidcSession struct {
	code    string
	expires time.Time
	once    sync.Once
}

type oidcSessionStore struct {
	mu       sync.Mutex
	sessions map[string]*oidcSession
}

var globalOIDCSessionStore = &oidcSessionStore{
	sessions: make(map[string]*oidcSession),
}

func (s *oidcSessionStore) register(state string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.purgeExpiredLocked()
	s.sessions[state] = &oidcSession{
		expires: time.Now().Add(oidcFlowTTL),
	}
}

func (s *oidcSessionStore) bindCode(state, code string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	sess, ok := s.sessions[state]
	if !ok || time.Now().After(sess.expires) {
		delete(s.sessions, state)
		return false
	}
	sess.code = code
	return true
}

func (s *oidcSessionStore) take(state string) (*oidcSession, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	sess, ok := s.sessions[state]
	if !ok || time.Now().After(sess.expires) || sess.code == "" {
		delete(s.sessions, state)
		return nil, false
	}
	delete(s.sessions, state)
	return sess, true
}

func (s *oidcSessionStore) purgeExpiredLocked() {
	now := time.Now()
	for state, sess := range s.sessions {
		if now.After(sess.expires) {
			delete(s.sessions, state)
		}
	}
}
