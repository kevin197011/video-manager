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

// StreamPathImportItem is one CSV row after parsing (table_id is the upsert key).
type StreamPathImportItem struct {
	Line       int    `json:"-"`
	TableID    string `json:"table_id"`
	FullPath   string `json:"full_path"`
	StreamID   int64  `json:"stream_id,omitempty"`
	StreamName string `json:"stream_name,omitempty"`
}

// StreamPathImportResult is returned by POST /api/stream-paths/import.
type StreamPathImportResult struct {
	Created int                        `json:"created"`
	Updated int                        `json:"updated"`
	Errors  []StreamPathImportRowError `json:"errors"`
}

// StreamPathImportRowError describes a row that was skipped during import.
type StreamPathImportRowError struct {
	Line    int    `json:"line"`
	TableID string `json:"table_id,omitempty"`
	Message string `json:"message"`
}

