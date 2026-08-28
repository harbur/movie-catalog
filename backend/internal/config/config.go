// Package config loads and validates the service configuration.
package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// DefaultPath is the single location the config is read from when CONFIG_FILE
// is not set. There is one default, not a search path.
const DefaultPath = "application.yaml"

// Config is the whole configuration of the service.
type Config struct {
	Server ServerConfig `yaml:"server"`
}

// ServerConfig configures the HTTP listener.
type ServerConfig struct {
	Address string `yaml:"address"`
	Port    int    `yaml:"port"`
}

// Addr renders the listen address for net.Listen.
func (c ServerConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Address, c.Port)
}

// Load reads the configuration from CONFIG_FILE, falling back to DefaultPath,
// and validates it. An invalid configuration is a startup failure naming the
// offending field.
func Load() (Config, error) {
	path := os.Getenv("CONFIG_FILE")
	if path == "" {
		path = DefaultPath
	}

	raw, err := os.ReadFile(path)
	if err != nil {
		return Config{}, fmt.Errorf("read config %q: %w", path, err)
	}

	var cfg Config
	if err := yaml.Unmarshal(raw, &cfg); err != nil {
		return Config{}, fmt.Errorf("parse config %q: %w", path, err)
	}

	if err := cfg.Validate(); err != nil {
		return Config{}, fmt.Errorf("invalid config %q: %w", path, err)
	}

	return cfg, nil
}

// Validate checks every constraint the rest of the code assumes holds.
func (c Config) Validate() error {
	if c.Server.Address == "" {
		return fmt.Errorf("server.address: must not be empty")
	}
	if c.Server.Port < 1 || c.Server.Port > 65535 {
		return fmt.Errorf("server.port: must be between 1 and 65535, got %d", c.Server.Port)
	}
	return nil
}
