// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

var ErrOIDCDisabled = errors.New("oidc is not configured")

type OIDCUserInfo struct {
	Subject           string `json:"sub"`
	Email             string `json:"email"`
	PreferredUsername string `json:"preferred_username"`
	Name              string `json:"name"`
}

type OIDCService struct {
	enabled            bool
	provider           *oidc.Provider
	verifier           *oidc.IDTokenVerifier
	oauth2Config       *oauth2.Config
	frontendSuccessURL string
}

type OIDCConfig struct {
	Enabled            bool
	IssuerURL          string
	ClientID           string
	ClientSecret       string
	RedirectURL        string
	Scopes             string
	FrontendSuccessURL string
}

func NewOIDCService(ctx context.Context) (*OIDCService, error) {
	cfg := OIDCConfig{
		Enabled:            strings.EqualFold(strings.TrimSpace(os.Getenv("OIDC_ENABLED")), "true"),
		IssuerURL:          strings.TrimSpace(os.Getenv("OIDC_ISSUER_URL")),
		ClientID:           strings.TrimSpace(os.Getenv("OIDC_CLIENT_ID")),
		ClientSecret:       strings.TrimSpace(os.Getenv("OIDC_CLIENT_SECRET")),
		RedirectURL:        strings.TrimSpace(os.Getenv("OIDC_REDIRECT_URL")),
		Scopes:             strings.TrimSpace(os.Getenv("OIDC_SCOPES")),
		FrontendSuccessURL: strings.TrimSpace(os.Getenv("OIDC_FRONTEND_SUCCESS_URL")),
	}
	return NewOIDCServiceFromConfig(ctx, cfg)
}

func NewOIDCServiceFromConfig(ctx context.Context, cfg OIDCConfig) (*OIDCService, error) {
	issuer := strings.TrimSpace(cfg.IssuerURL)
	clientID := strings.TrimSpace(cfg.ClientID)
	clientSecret := strings.TrimSpace(cfg.ClientSecret)
	redirectURL := strings.TrimSpace(cfg.RedirectURL)

	service := &OIDCService{
		enabled: false,
	}

	if !cfg.Enabled || issuer == "" || clientID == "" || clientSecret == "" || redirectURL == "" {
		return service, nil
	}

	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize oidc provider: %w", err)
	}

	scopes := []string{oidc.ScopeOpenID, "profile", "email"}
	if rawScopes := strings.TrimSpace(cfg.Scopes); rawScopes != "" {
		customScopes := strings.Fields(rawScopes)
		if len(customScopes) > 0 {
			scopes = customScopes
		}
	}

	frontendSuccessURL := strings.TrimSpace(cfg.FrontendSuccessURL)
	if frontendSuccessURL == "" {
		frontendSuccessURL = "/login"
	}

	service.enabled = true
	service.provider = provider
	service.verifier = provider.Verifier(&oidc.Config{ClientID: clientID})
	service.oauth2Config = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectURL,
		Scopes:       scopes,
	}
	service.frontendSuccessURL = frontendSuccessURL

	return service, nil
}

func (s *OIDCService) IsEnabled() bool {
	return s != nil && s.enabled
}

func (s *OIDCService) AuthCodeURL(state string) (string, error) {
	if !s.IsEnabled() {
		return "", ErrOIDCDisabled
	}
	return s.oauth2Config.AuthCodeURL(state), nil
}

func (s *OIDCService) ExchangeAndVerify(ctx context.Context, code string) (*OIDCUserInfo, error) {
	if !s.IsEnabled() {
		return nil, ErrOIDCDisabled
	}

	token, err := s.oauth2Config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange oidc code: %w", err)
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		return nil, errors.New("id_token not found in token response")
	}

	idToken, err := s.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, fmt.Errorf("failed to verify id_token: %w", err)
	}

	var info OIDCUserInfo
	if err := idToken.Claims(&info); err != nil {
		return nil, fmt.Errorf("failed to parse id_token claims: %w", err)
	}
	return &info, nil
}

func (s *OIDCService) FrontendSuccessURL() string {
	if s == nil || s.frontendSuccessURL == "" {
		return "/login"
	}
	return s.frontendSuccessURL
}
