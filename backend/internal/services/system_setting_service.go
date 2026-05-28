// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package services

import (
	"context"
	"os"
	"strings"

	"github.com/video-manager/backend/internal/models"
	"github.com/video-manager/backend/internal/repositories"
)

const (
	settingOIDCEnabled            = "oidc_enabled"
	settingOIDCIssuerURL          = "oidc_issuer_url"
	settingOIDCClientID           = "oidc_client_id"
	settingOIDCClientSecret       = "oidc_client_secret"
	settingOIDCRedirectURL        = "oidc_redirect_url"
	settingOIDCScopes             = "oidc_scopes"
	settingOIDCFrontendSuccessURL = "oidc_frontend_success_url"
)

type SystemSettingService struct {
	repo *repositories.SystemSettingRepository
}

func NewSystemSettingService() *SystemSettingService {
	return &SystemSettingService{
		repo: repositories.NewSystemSettingRepository(),
	}
}

func (s *SystemSettingService) GetOIDCSettings(ctx context.Context) (*models.OIDCSettings, error) {
	values, err := s.repo.GetByPrefix(ctx, "oidc_")
	if err != nil {
		return nil, err
	}

	settings := &models.OIDCSettings{
		Enabled:            false,
		IssuerURL:          strings.TrimSpace(values[settingOIDCIssuerURL]),
		ClientID:           strings.TrimSpace(values[settingOIDCClientID]),
		ClientSecret:       strings.TrimSpace(values[settingOIDCClientSecret]),
		RedirectURL:        strings.TrimSpace(values[settingOIDCRedirectURL]),
		Scopes:             strings.TrimSpace(values[settingOIDCScopes]),
		FrontendSuccessURL: strings.TrimSpace(values[settingOIDCFrontendSuccessURL]),
	}
	if values[settingOIDCEnabled] == "true" {
		settings.Enabled = true
	}

	// Fallback to env values when DB is not configured yet.
	if settings.IssuerURL == "" {
		settings.IssuerURL = strings.TrimSpace(os.Getenv("OIDC_ISSUER_URL"))
	}
	if settings.ClientID == "" {
		settings.ClientID = strings.TrimSpace(os.Getenv("OIDC_CLIENT_ID"))
	}
	if settings.ClientSecret == "" {
		settings.ClientSecret = strings.TrimSpace(os.Getenv("OIDC_CLIENT_SECRET"))
	}
	if settings.RedirectURL == "" {
		settings.RedirectURL = strings.TrimSpace(os.Getenv("OIDC_REDIRECT_URL"))
	}
	if settings.Scopes == "" {
		settings.Scopes = strings.TrimSpace(os.Getenv("OIDC_SCOPES"))
	}
	if settings.FrontendSuccessURL == "" {
		settings.FrontendSuccessURL = strings.TrimSpace(os.Getenv("OIDC_FRONTEND_SUCCESS_URL"))
	}
	if !settings.Enabled {
		settings.Enabled = strings.EqualFold(strings.TrimSpace(os.Getenv("OIDC_ENABLED")), "true")
	}

	return settings, nil
}

func (s *SystemSettingService) GetOIDCSettingsResponse(ctx context.Context) (*models.OIDCSettingsResponse, error) {
	settings, err := s.GetOIDCSettings(ctx)
	if err != nil {
		return nil, err
	}
	return &models.OIDCSettingsResponse{
		Enabled:            settings.Enabled,
		IssuerURL:          settings.IssuerURL,
		ClientID:           settings.ClientID,
		RedirectURL:        settings.RedirectURL,
		Scopes:             settings.Scopes,
		FrontendSuccessURL: settings.FrontendSuccessURL,
		HasClientSecret:    settings.ClientSecret != "",
	}, nil
}

func (s *SystemSettingService) UpdateOIDCSettings(ctx context.Context, req models.UpdateOIDCSettingsRequest) error {
	if err := s.repo.Upsert(ctx, settingOIDCEnabled, boolToString(req.Enabled)); err != nil {
		return err
	}
	if err := s.repo.Upsert(ctx, settingOIDCIssuerURL, strings.TrimSpace(req.IssuerURL)); err != nil {
		return err
	}
	if err := s.repo.Upsert(ctx, settingOIDCClientID, strings.TrimSpace(req.ClientID)); err != nil {
		return err
	}
	if err := s.repo.Upsert(ctx, settingOIDCRedirectURL, strings.TrimSpace(req.RedirectURL)); err != nil {
		return err
	}
	if err := s.repo.Upsert(ctx, settingOIDCScopes, strings.TrimSpace(req.Scopes)); err != nil {
		return err
	}
	if err := s.repo.Upsert(ctx, settingOIDCFrontendSuccessURL, strings.TrimSpace(req.FrontendSuccessURL)); err != nil {
		return err
	}

	if req.ClearClientSecret {
		return s.repo.Delete(ctx, settingOIDCClientSecret)
	}
	if strings.TrimSpace(req.ClientSecret) != "" {
		return s.repo.Upsert(ctx, settingOIDCClientSecret, strings.TrimSpace(req.ClientSecret))
	}
	return nil
}

func boolToString(v bool) string {
	if v {
		return "true"
	}
	return "false"
}
