// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package repositories

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/video-manager/backend/internal/models"
	"github.com/video-manager/backend/pkg/database"
)

var (
	ErrStreamNotFound   = errors.New("stream not found")
	ErrStreamCodeExists = errors.New("stream code already exists")
)

type StreamRepository struct{}

func NewStreamRepository() *StreamRepository {
	return &StreamRepository{}
}

// GetAll retrieves all streams
func (r *StreamRepository) GetAll(ctx context.Context) ([]models.Stream, error) {
	query := `SELECT id, name, code, created_at, updated_at FROM streams ORDER BY created_at DESC`
	rows, err := database.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var streams []models.Stream
	for rows.Next() {
		var s models.Stream
		if err := rows.Scan(&s.ID, &s.Name, &s.Code, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		streams = append(streams, s)
	}

	return streams, rows.Err()
}

// GetByID retrieves a stream by ID
func (r *StreamRepository) GetByID(ctx context.Context, id int64) (*models.Stream, error) {
	query := `SELECT id, name, code, created_at, updated_at FROM streams WHERE id = $1`
	var s models.Stream
	err := database.DB.QueryRow(ctx, query, id).Scan(&s.ID, &s.Name, &s.Code, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, ErrStreamNotFound
		}
		return nil, err
	}
	return &s, nil
}

// Create creates a new stream
func (r *StreamRepository) Create(ctx context.Context, name, code string) (*models.Stream, error) {
	// Check if stream code already exists
	var exists bool
	err := database.DB.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM streams WHERE code = $1)`, code).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrStreamCodeExists
	}

	query := `INSERT INTO streams (name, code) VALUES ($1, $2) RETURNING id, name, code, created_at, updated_at`
	var s models.Stream
	err = database.DB.QueryRow(ctx, query, name, code).Scan(&s.ID, &s.Name, &s.Code, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Update updates an existing stream
func (r *StreamRepository) Update(ctx context.Context, id int64, name, code string) (*models.Stream, error) {
	// Check if stream exists
	_, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Check if new code already exists (excluding current stream)
	var exists bool
	err = database.DB.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM streams WHERE code = $1 AND id != $2)`, code, id).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrStreamCodeExists
	}

	query := `UPDATE streams SET name = $1, code = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, code, created_at, updated_at`
	var s models.Stream
	err = database.DB.QueryRow(ctx, query, name, code, id).Scan(&s.ID, &s.Name, &s.Code, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Delete deletes a stream
func (r *StreamRepository) Delete(ctx context.Context, id int64) error {
	// Check if stream exists
	_, err := r.GetByID(ctx, id)
	if err != nil {
		return err
	}


	// Delete associated video stream endpoints first (they are auto-generated)
	_, err = database.DB.Exec(ctx, `DELETE FROM video_stream_endpoints WHERE stream_id = $1`, id)
	if err != nil {
		return err
	}

	query := `DELETE FROM streams WHERE id = $1`
	_, err = database.DB.Exec(ctx, query, id)
	return err
}

