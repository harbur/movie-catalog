// Package metrics implements the telemetry ports on top of Prometheus.
package metrics

import (
	"github.com/prometheus/client_golang/prometheus"

	"github.com/harbur/movie-catalog/backend/internal/app"
)

// Prometheus counts use cases as they succeed.
type Prometheus struct {
	actions *prometheus.CounterVec
}

var _ app.ActionCounter = (*Prometheus)(nil)

// NewPrometheus registers the app counters against the given registry.
func NewPrometheus(registry prometheus.Registerer) (*Prometheus, error) {
	actions := prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "app_actions",
		Help: "Counter of successful actions",
	}, []string{"action"})

	if err := registry.Register(actions); err != nil {
		return nil, err
	}
	return &Prometheus{actions: actions}, nil
}

// IncrementAction counts one successful action.
func (p *Prometheus) IncrementAction(action string) {
	p.actions.WithLabelValues(action).Inc()
}
