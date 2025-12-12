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
	ErrLineNotFound = errors.New("cdn line not found")
)

type CDNLineRepository struct{}

func NewCDNLineRepository() *CDNLineRepository {
	return &CDNLineRepository{}
}

// GetAll retrieves all CDN lines with optional provider filter
func (r *CDNLineRepository) GetAll(ctx context.Context, providerID *int64) ([]models.CDNLine, error) {
	var query string
	var args []interface{}

	if providerID != nil {
		query = `SELECT l.id, l.provider_id, l.name, l.display_name, l.created_at, l.updated_at,
		         p.id, p.name, p.code, p.created_at, p.updated_at
		         FROM cdn_lines l
		         JOIN cdn_providers p ON l.provider_id = p.id
		         WHERE l.provider_id = $1
		         ORDER BY l.created_at DESC`
		args = []interface{}{*providerID}
	} else {
		query = `SELECT l.id, l.provider_id, l.name, l.display_name, l.created_at, l.updated_at,
		         p.id, p.name, p.code, p.created_at, p.updated_at
		         FROM cdn_lines l
		         JOIN cdn_providers p ON l.provider_id = p.id
		         ORDER BY l.created_at DESC`
		args = []interface{}{}
	}

	rows, err := database.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lines []models.CDNLine
	for rows.Next() {
		var l models.CDNLine
		var p models.CDNProvider
		if err := rows.Scan(
			&l.ID, &l.ProviderID, &l.Name, &l.DisplayName, &l.CreatedAt, &l.UpdatedAt,
			&p.ID, &p.Name, &p.Code, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		l.Provider = &p
		lines = append(lines, l)
	}

	return lines, rows.Err()
}

// GetByID retrieves a CDN line by ID
func (r *CDNLineRepository) GetByID(ctx context.Context, id int64) (*models.CDNLine, error) {
	query := `SELECT l.id, l.provider_id, l.name, l.display_name, l.created_at, l.updated_at,
	          p.id, p.name, p.code, p.created_at, p.updated_at
	          FROM cdn_lines l
	          JOIN cdn_providers p ON l.provider_id = p.id
	          WHERE l.id = $1`
	var l models.CDNLine
	var p models.CDNProvider
	err := database.DB.QueryRow(ctx, query, id).Scan(
		&l.ID, &l.ProviderID, &l.Name, &l.DisplayName, &l.CreatedAt, &l.UpdatedAt,
		&p.ID, &p.Name, &p.Code, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrLineNotFound
		}
		return nil, err
	}
	l.Provider = &p
	return &l, nil
}

// Create creates a new CDN line
func (r *CDNLineRepository) Create(ctx context.Context, providerID int64, name, displayName string) (*models.CDNLine, error) {
	// Verify provider exists
	providerRepo := NewCDNProviderRepository()
	_, err := providerRepo.GetByID(ctx, providerID)
	if err != nil {
		return nil, err
	}

	query := `INSERT INTO cdn_lines (provider_id, name, display_name, created_at, updated_at)
	          VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, provider_id, name, display_name, created_at, updated_at`
	var l models.CDNLine
	err = database.DB.QueryRow(ctx, query, providerID, name, displayName).Scan(
		&l.ID, &l.ProviderID, &l.Name, &l.DisplayName, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

// Update updates an existing CDN line
func (r *CDNLineRepository) Update(ctx context.Context, id int64, providerID int64, name, displayName string) (*models.CDNLine, error) {
	// Check if line exists
	_, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Verify provider exists
	providerRepo := NewCDNProviderRepository()
	_, err = providerRepo.GetByID(ctx, providerID)
	if err != nil {
		return nil, err
	}

	query := `UPDATE cdn_lines SET provider_id = $1, name = $2, display_name = $3, updated_at = NOW()
	          WHERE id = $4 RETURNING id, provider_id, name, display_name, created_at, updated_at`
	var l models.CDNLine
	err = database.DB.QueryRow(ctx, query, providerID, name, displayName, id).Scan(
		&l.ID, &l.ProviderID, &l.Name, &l.DisplayName, &l.CreatedAt, &l.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &l, nil
}

// Delete deletes a CDN line
func (r *CDNLineRepository) Delete(ctx context.Context, id int64) error {
	// Check if line exists
	_, err := r.GetByID(ctx, id)
	if err != nil {
		return err
	}


	// Delete associated video stream endpoints first (they are auto-generated)
	_, err = database.DB.Exec(ctx, `DELETE FROM video_stream_endpoints WHERE line_id = $1`, id)
	if err != nil {
		return err
	}

	query := `DELETE FROM cdn_lines WHERE id = $1`
	_, err = database.DB.Exec(ctx, query, id)
	return err
}

