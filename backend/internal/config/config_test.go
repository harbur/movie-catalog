package config_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/harbur/movie-catalog/backend/internal/config"
)

func writeConfig(t *testing.T, contents string) string {
	t.Helper()

	path := filepath.Join(t.TempDir(), "application.yaml")
	require.NoError(t, os.WriteFile(path, []byte(contents), 0o600))
	return path
}

func TestLoad(t *testing.T) {
	path := writeConfig(t, "server:\n  address: 0.0.0.0\n  port: 8080\n")
	t.Setenv("CONFIG_FILE", path)

	cfg, err := config.Load()

	require.NoError(t, err)
	assert.Equal(t, "0.0.0.0:8080", cfg.Server.Addr())
}

func TestLoadFailures(t *testing.T) {
	tests := []struct {
		name     string
		contents string
		wantErr  string
	}{
		{
			name:     "missing address",
			contents: "server:\n  port: 8080\n",
			wantErr:  "server.address",
		},
		{
			name:     "port out of range",
			contents: "server:\n  address: 0.0.0.0\n  port: 70000\n",
			wantErr:  "server.port",
		},
		{
			name:     "malformed yaml",
			contents: "server: [\n",
			wantErr:  "parse config",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("CONFIG_FILE", writeConfig(t, tt.contents))

			_, err := config.Load()

			require.Error(t, err)
			assert.Contains(t, err.Error(), tt.wantErr)
		})
	}
}

func TestLoadMissingFile(t *testing.T) {
	t.Setenv("CONFIG_FILE", filepath.Join(t.TempDir(), "absent.yaml"))

	_, err := config.Load()

	require.Error(t, err)
	assert.Contains(t, err.Error(), "read config")
}

// TestLoadFallsBackToDefaultPath covers the branch taken when CONFIG_FILE is
// unset: Load must fall back to config.DefaultPath rather than an empty path.
func TestLoadFallsBackToDefaultPath(t *testing.T) {
	t.Setenv("CONFIG_FILE", "")
	t.Chdir(t.TempDir())

	_, err := config.Load()

	require.Error(t, err)
	assert.Contains(t, err.Error(), config.DefaultPath)
}

// TestShippedConfigIsValid guards the application.yaml committed to the repo.
func TestShippedConfigIsValid(t *testing.T) {
	t.Setenv("CONFIG_FILE", filepath.Join("..", "..", "..", config.DefaultPath))

	_, err := config.Load()

	assert.NoError(t, err)
}
