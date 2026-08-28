package domain_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/harbur/movie-catalog/backend/internal/domain"
)

func TestMovieValidate(t *testing.T) {
	tests := []struct {
		name    string
		movie   domain.Movie
		wantErr error
	}{
		{
			name:  "named movie is valid",
			movie: domain.Movie{ID: 1, Name: "godfather"},
		},
		{
			name:    "empty name is invalid",
			movie:   domain.Movie{ID: 1},
			wantErr: domain.ErrNameRequired,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.ErrorIs(t, tt.movie.Validate(), tt.wantErr)
		})
	}
}
