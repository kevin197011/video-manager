// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/video-manager/backend/internal/models"
	"github.com/video-manager/backend/internal/repositories"
	"github.com/video-manager/backend/internal/services"
	"github.com/video-manager/backend/pkg/jwt"
	"github.com/video-manager/backend/pkg/logger"
	"github.com/video-manager/backend/pkg/response"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: services.NewAuthService(),
	}
}

// Login handles user login
// @Summary User login
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login credentials"
// @Success 200 {object} response.Response{data=models.LoginResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	loginResp, err := h.authService.Login(c.Request.Context(), req.Username, req.Password)
	if err != nil {
		logger.Warn("Login failed", "username", req.Username, "ip", c.ClientIP(), "error", err)
		response.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	logger.Info("User logged in successfully", "username", loginResp.Username, "is_admin", loginResp.IsAdmin, "ip", c.ClientIP())
	response.Success(c, loginResp)
}

// ChangePassword handles password change
// @Summary Change password
// @Description Change user password
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ChangePasswordRequest true "Password change request"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	err := h.authService.ChangePassword(
		c.Request.Context(),
		userID.(int64),
		req.OldPassword,
		req.NewPassword,
	)
	if err != nil {
		logger.Warn("Password change failed", "user_id", userID, "error", err)
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	logger.Info("Password changed successfully", "user_id", userID)
	response.Success(c, gin.H{"message": "password changed successfully"})
}

// GetCurrentUser returns current user information
// @Summary Get current user
// @Description Get current authenticated user information
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=object}
// @Failure 401 {object} response.Response
// @Router /api/auth/me [get]
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("userID")
	username, _ := c.Get("username")
	isAdmin, _ := c.Get("isAdmin")

	response.Success(c, gin.H{
		"id":       userID,
		"username": username,
		"is_admin": isAdmin,
	})
}

// GetTokenInfo returns current token information
// @Summary Get token information
// @Description Get current JWT token information including expiration time
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=object}
// @Failure 401 {object} response.Response
// @Router /api/auth/token-info [get]
func (h *AuthHandler) GetTokenInfo(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		response.Error(c, http.StatusUnauthorized, "authorization header required")
		return
	}

	// Extract token from "Bearer <token>"
	tokenString := ""
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	} else {
		response.Error(c, http.StatusBadRequest, "invalid authorization header format")
		return
	}

	// Parse token to get claims (without validation since we already validated in middleware)
	claims, err := jwt.ParseTokenWithoutValidation(tokenString)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "invalid token format")
		return
	}

	// Calculate expiration time
	expiresAt := time.Time{}
	if claims.ExpiresAt != nil {
		expiresAt = claims.ExpiresAt.Time
	}

	issuedAt := time.Time{}
	if claims.IssuedAt != nil {
		issuedAt = claims.IssuedAt.Time
	}

	response.Success(c, gin.H{
		"user_id":    claims.UserID,
		"username":   claims.Username,
		"is_admin":   claims.IsAdmin,
		"issued_at":  issuedAt,
		"expires_at": expiresAt,
		"expires_in": int64(time.Until(expiresAt).Seconds()),
		"issuer":     claims.Issuer,
		"subject":    claims.Subject,
	})
}

// CreateToken creates a new token
// @Summary Create token
// @Description Create a new JWT token with custom expiration
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CreateTokenRequest true "Token creation request"
// @Success 200 {object} response.Response{data=models.LoginResponse}
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/auth/tokens [post]
func (h *AuthHandler) CreateToken(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	username, _ := c.Get("username")
	isAdmin, _ := c.Get("isAdmin")

	var req models.CreateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	token, err := h.authService.CreateToken(
		c.Request.Context(),
		userID.(int64),
		username.(string),
		isAdmin.(bool),
		req,
	)
	if err != nil {
		if err == repositories.ErrTokenNameExists {
			response.BadRequest(c, "Token 名称已存在")
		} else {
			response.Error(c, http.StatusBadRequest, err.Error())
		}
		return
	}

	logger.InfoContext(c.Request.Context(), "Token created successfully", "user_id", userID, "name", req.Name, "never_expire", req.NeverExpire)
	response.Success(c, gin.H{
		"token":      token,
		"username":   username,
		"is_admin":   isAdmin,
		"name":       req.Name,
		"never_expire": req.NeverExpire,
	})
}

// GetTokens retrieves all tokens for the current user
// @Summary Get all tokens
// @Description Get all tokens created by the current user
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]models.Token}
// @Failure 401 {object} response.Response
// @Router /api/auth/tokens [get]
func (h *AuthHandler) GetTokens(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	tokens, err := h.authService.GetTokens(c.Request.Context(), userID.(int64))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, tokens)
}

// DeleteToken deletes a token by ID
// @Summary Delete token
// @Description Delete a token by ID (only if it belongs to the current user)
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Param id path int true "Token ID"
// @Success 200 {object} response.Response
// @Failure 400 {object} response.Response
// @Failure 401 {object} response.Response
// @Router /api/auth/tokens/{id} [delete]
func (h *AuthHandler) DeleteToken(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "user not authenticated")
		return
	}

	tokenID := c.Param("id")
	if tokenID == "" {
		response.BadRequest(c, "token id is required")
		return
	}

	var id int64
	if _, err := fmt.Sscanf(tokenID, "%d", &id); err != nil {
		response.BadRequest(c, "invalid token id")
		return
	}

	err := h.authService.DeleteToken(c.Request.Context(), id, userID.(int64))
	if err != nil {
		if errors.Is(err, repositories.ErrTokenNotFound) {
			response.Error(c, http.StatusNotFound, "token not found")
			return
		}
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	logger.InfoContext(c.Request.Context(), "Token deleted successfully", "user_id", userID, "token_id", id)
	response.Success(c, gin.H{"message": "token deleted successfully"})
}

