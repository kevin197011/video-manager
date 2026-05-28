// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/video-manager/backend/internal/models"
	"github.com/video-manager/backend/internal/services"
	"github.com/video-manager/backend/pkg/response"
)

type SystemSettingHandler struct {
	service *services.SystemSettingService
}

func NewSystemSettingHandler() *SystemSettingHandler {
	return &SystemSettingHandler{
		service: services.NewSystemSettingService(),
	}
}

// GetOIDCSettings handles GET /api/system-settings/oidc
// @Summary Get OIDC settings
// @Description Retrieve OIDC SSO configuration (admin only)
// @Tags system-settings
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=models.OIDCSettingsResponse}
// @Failure 500 {object} response.Response
// @Router /api/system-settings/oidc [get]
func (h *SystemSettingHandler) GetOIDCSettings(c *gin.Context) {
	data, err := h.service.GetOIDCSettingsResponse(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "failed to load oidc settings")
		return
	}
	response.Success(c, data)
}

// UpdateOIDCSettings handles PUT /api/system-settings/oidc
// @Summary Update OIDC settings
// @Description Update OIDC SSO configuration (admin only)
// @Tags system-settings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.UpdateOIDCSettingsRequest true "OIDC settings request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 500 {object} response.Response
// @Router /api/system-settings/oidc [put]
func (h *SystemSettingHandler) UpdateOIDCSettings(c *gin.Context) {
	var req models.UpdateOIDCSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if err := h.service.UpdateOIDCSettings(c.Request.Context(), req); err != nil {
		response.InternalServerError(c, "failed to update oidc settings")
		return
	}
	response.Success(c, gin.H{"message": "oidc settings updated"})
}
