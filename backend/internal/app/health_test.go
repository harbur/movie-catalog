package app_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/harbur/movie-catalog/backend/internal/app"
	"github.com/harbur/movie-catalog/backend/internal/domain"
)

func TestHealthzReturnsBuildInfo(t *testing.T) {
	buildInfo := domain.BuildInfo{
		BuildDate:  "2026-08-28",
		GitBranch:  "main",
		GitCommit:  "abc123",
		GitState:   "clean",
		GitSummary: "v1.0.0",
	}

	assert.Equal(t, buildInfo, app.NewHealthService(buildInfo).Healthz())
}
