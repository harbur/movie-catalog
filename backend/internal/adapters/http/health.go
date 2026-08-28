package http

import (
	"context"

	"github.com/danielgtaylor/huma/v2"

	"github.com/harbur/golang-gin-starter/internal/app"
)

// HealthzOutput is the response of the healthz routes.
type HealthzOutput struct {
	Body HealthzBody
}

// registerHealth registers the liveness routes. Both the bare and the
// api-prefixed path are kept so probes configured against either keep working.
func registerHealth(api huma.API, health *app.HealthService) {
	handler := func(ctx context.Context, _ *struct{}) (*HealthzOutput, error) {
		return &HealthzOutput{
			Body: HealthzBody{BuildInfo: toBuildInfoBody(health.Healthz())},
		}, nil
	}

	for _, path := range []string{"/healthz", "/api/healthz"} {
		operationID := "healthz"
		if path == "/api/healthz" {
			operationID = "api-healthz"
		}

		huma.Register(api, huma.Operation{
			OperationID: operationID,
			Method:      "GET",
			Path:        path,
			Summary:     "Liveness probe",
			Description: "Returns the build information of the running binary.",
			Tags:        []string{"healthz"},
		}, handler)
	}
}
