// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package services

import (
	"context"
	"strings"

	"github.com/video-manager/backend/internal/models"
	"github.com/video-manager/backend/internal/repositories"
)

type StreamPathService struct {
	repo *repositories.StreamPathRepository
}

func NewStreamPathService() *StreamPathService {
	return &StreamPathService{
		repo: repositories.NewStreamPathRepository(),
	}
}

// GetAll retrieves all stream paths, optionally filtered by stream_id
func (s *StreamPathService) GetAll(ctx context.Context, streamID *int64) ([]models.StreamPath, error) {
	return s.repo.GetAll(ctx, streamID)
}

// GetByID retrieves a stream path by ID
func (s *StreamPathService) GetByID(ctx context.Context, id int64) (*models.StreamPath, error) {
	return s.repo.GetByID(ctx, id)
}

// Create creates a new stream path
func (s *StreamPathService) Create(ctx context.Context, req models.CreateStreamPathRequest) (*models.StreamPath, error) {
	// Normalize input
	tableID := strings.TrimSpace(req.TableID)
	fullPath := strings.TrimSpace(req.FullPath)
	path, err := s.repo.Create(ctx, req.StreamID, tableID, fullPath)
	if err != nil {
		return nil, err
	}

	// Auto-regenerate video stream endpoints
	endpointService := NewVideoStreamEndpointService()
	_, _ = endpointService.GenerateAll(ctx) // Ignore errors in auto-generation

	return path, nil
}

// Update updates an existing stream path
func (s *StreamPathService) Update(ctx context.Context, id int64, req models.UpdateStreamPathRequest) (*models.StreamPath, error) {
	// Normalize input
	tableID := strings.TrimSpace(req.TableID)
	fullPath := strings.TrimSpace(req.FullPath)
	path, err := s.repo.Update(ctx, id, req.StreamID, tableID, fullPath)
	if err != nil {
		return nil, err
	}

	// Auto-regenerate video stream endpoints
	endpointService := NewVideoStreamEndpointService()
	_, _ = endpointService.GenerateAll(ctx) // Ignore errors in auto-generation

	return path, nil
}

// Delete deletes a stream path
func (s *StreamPathService) Delete(ctx context.Context, id int64) error {
	err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}

	// Auto-regenerate video stream endpoints
	endpointService := NewVideoStreamEndpointService()
	_, _ = endpointService.GenerateAll(ctx) // Ignore errors in auto-generation

	return nil
}

