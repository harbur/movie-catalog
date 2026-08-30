package main

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

// run is wiring: config, then adapters, then the server. This covers the
// first failure exit, which needs no server or signal handling to reach.
func TestRunFailsOnInvalidConfig(t *testing.T) {
	t.Setenv("CONFIG_FILE", filepath.Join(t.TempDir(), "absent.yaml"))

	err := run()

	assert.ErrorContains(t, err, "read config")
}
