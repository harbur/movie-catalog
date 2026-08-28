package http

import "github.com/harbur/golang-gin-starter/internal/domain"

// Wire models live in the HTTP adapter and are deliberately distinct from the
// domain types. Validation constraints are expressed as struct tags so they end
// up in the published OpenAPI schema rather than in handler code.

// MovieBody is a movie as it appears on the wire.
type MovieBody struct {
	ID   uint   `json:"id" doc:"Unique identifier, assigned by the server" readOnly:"true"`
	Name string `json:"name" minLength:"1" maxLength:"255" doc:"Title of the movie" example:"godfather"`
}

// MovieInput is the payload accepted when creating or replacing a movie.
type MovieInput struct {
	Name string `json:"name" required:"true" minLength:"1" maxLength:"255" doc:"Title of the movie" example:"godfather"`
}

// BuildInfoBody describes the running binary.
type BuildInfoBody struct {
	BuildDate  string `json:"buildDate" doc:"Date the binary was built"`
	GitBranch  string `json:"gitBranch" doc:"Branch the binary was built from"`
	GitCommit  string `json:"gitCommit" doc:"Commit the binary was built from"`
	GitState   string `json:"gitState" doc:"Working tree state at build time: clean or dirty"`
	GitSummary string `json:"gitSummary" doc:"Git describe summary of the build"`
}

// HealthzBody is the healthz response payload.
type HealthzBody struct {
	BuildInfo BuildInfoBody `json:"buildInfo" doc:"Build information of the running binary"`
}

func toMovieBody(movie domain.Movie) MovieBody {
	return MovieBody{
		ID:   movie.ID,
		Name: movie.Name,
	}
}

func toMovieBodies(movies []domain.Movie) []MovieBody {
	bodies := make([]MovieBody, 0, len(movies))
	for _, movie := range movies {
		bodies = append(bodies, toMovieBody(movie))
	}
	return bodies
}

func toBuildInfoBody(info domain.BuildInfo) BuildInfoBody {
	return BuildInfoBody{
		BuildDate:  info.BuildDate,
		GitBranch:  info.GitBranch,
		GitCommit:  info.GitCommit,
		GitState:   info.GitState,
		GitSummary: info.GitSummary,
	}
}
