package metrics_test

import (
	"testing"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/harbur/movie-catalog/backend/internal/adapters/metrics"
)

// counterValue finds the app_actions counter for the given label in what the
// registry gathers, or fails the test if it is absent.
func counterValue(t *testing.T, registry *prometheus.Registry, action string) float64 {
	t.Helper()

	families, err := registry.Gather()
	require.NoError(t, err)

	for _, family := range families {
		if family.GetName() != "app_actions" {
			continue
		}
		for _, m := range family.GetMetric() {
			for _, label := range m.GetLabel() {
				if label.GetName() == "action" && label.GetValue() == action {
					return m.GetCounter().GetValue()
				}
			}
		}
	}

	t.Fatalf("no app_actions metric found for action %q", action)
	return 0
}

func TestIncrementAction(t *testing.T) {
	registry := prometheus.NewRegistry()
	p, err := metrics.NewPrometheus(registry)
	require.NoError(t, err)

	p.IncrementAction("list movies")
	p.IncrementAction("list movies")
	p.IncrementAction("post movie")

	assert.Equal(t, float64(2), counterValue(t, registry, "list movies"))
	assert.Equal(t, float64(1), counterValue(t, registry, "post movie"))
}

func TestNewPrometheusRegistersOnce(t *testing.T) {
	registry := prometheus.NewRegistry()

	_, err := metrics.NewPrometheus(registry)
	require.NoError(t, err)

	// Registering the same collector name twice against the same registry
	// fails; NewPrometheus must surface that error rather than panicking.
	_, err = metrics.NewPrometheus(registry)
	assert.Error(t, err)
}
