// Copyright (c) 2025 kk
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

package models

import "time"

// StreamPath represents a stream path entity
type StreamPath struct {
	ID        int64     `json:"id" db:"id"`
	StreamID  int64     `json:"stream_id" db:"stream_id"`
	Stream    *Stream   `json:"stream,omitempty"`
	TableID   string    `json:"table_id" db:"table_id"`
	FullPath  string    `json:"full_path" db:"full_path"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// CreateStreamPathRequest represents the request payload for creating a stream path
type CreateStreamPathRequest struct {
	StreamID int64  `json:"stream_id" binding:"required"`
	TableID  string `json:"table_id" binding:"required,min=1,max=255"`
	FullPath string `json:"full_path" binding:"required,min=1,max=500"`
}

// UpdateStreamPathRequest represents the request payload for updating a stream path
type UpdateStreamPathRequest struct {
	StreamID int64  `json:"stream_id" binding:"required"`
	TableID  string `json:"table_id" binding:"required,min=1,max=255"`
	FullPath string `json:"full_path" binding:"required,min=1,max=500"`
}

