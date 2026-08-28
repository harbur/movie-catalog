package app

import "github.com/harbur/golang-gin-starter/internal/domain"

// HealthService reports whether the service is up and what is running.
type HealthService struct {
	buildInfo domain.BuildInfo
}

// NewHealthService wires a HealthService to the build stamped into the binary.
func NewHealthService(buildInfo domain.BuildInfo) *HealthService {
	return &HealthService{buildInfo: buildInfo}
}

// Healthz returns the build information of the running binary.
func (s *HealthService) Healthz() domain.BuildInfo {
	return s.buildInfo
}
