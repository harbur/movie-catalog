package http

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	log "github.com/sirupsen/logrus"

	"github.com/harbur/golang-gin-starter/internal/app"
	"github.com/harbur/golang-gin-starter/internal/domain"
)

// movieIDInput carries the path parameter shared by the single-movie routes.
type movieIDInput struct {
	ID uint `path:"id" minimum:"1" doc:"Unique identifier of the movie"`
}

// ListMoviesOutput is the response of GET /api/movies.
type ListMoviesOutput struct {
	Body []MovieBody
}

// MovieOutput is the response of the routes returning a single movie.
type MovieOutput struct {
	Body MovieBody
}

// CreateMovieInput is the request of POST /api/movies.
type CreateMovieInput struct {
	Body MovieInput
}

// UpdateMovieInput is the request of PUT /api/movies/{id}.
type UpdateMovieInput struct {
	ID   uint `path:"id" minimum:"1" doc:"Unique identifier of the movie"`
	Body MovieInput
}

// NoContentOutput is an empty 204 response.
type NoContentOutput struct{}

// registerMovies registers the movie operations. The huma.Operation metadata is
// the published documentation, so it is spelled out rather than inferred.
func registerMovies(api huma.API, movies *app.MovieService) {
	huma.Register(api, huma.Operation{
		OperationID: "list-movies",
		Method:      "GET",
		Path:        "/api/movies",
		Summary:     "List movies",
		Description: "Returns every movie in the catalogue.",
		Tags:        []string{"movies"},
	}, func(ctx context.Context, _ *struct{}) (*ListMoviesOutput, error) {
		log.Info("list movies")

		result, err := movies.ListMovies(ctx)
		if err != nil {
			return nil, mapError(err)
		}
		return &ListMoviesOutput{Body: toMovieBodies(result)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID:   "create-movie",
		Method:        "POST",
		Path:          "/api/movies",
		Summary:       "Create a movie",
		Description:   "Adds a movie to the catalogue. The id is assigned by the server.",
		Tags:          []string{"movies"},
		DefaultStatus: 201,
	}, func(ctx context.Context, input *CreateMovieInput) (*MovieOutput, error) {
		log.Info("post movie")

		created, err := movies.CreateMovie(ctx, domain.Movie{Name: input.Body.Name})
		if err != nil {
			return nil, mapError(err)
		}
		return &MovieOutput{Body: toMovieBody(created)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "get-movie",
		Method:      "GET",
		Path:        "/api/movies/{id}",
		Summary:     "Get a movie",
		Description: "Returns a single movie by its id.",
		Tags:        []string{"movies"},
	}, func(ctx context.Context, input *movieIDInput) (*MovieOutput, error) {
		log.Info("get movie")

		movie, err := movies.GetMovie(ctx, input.ID)
		if err != nil {
			return nil, mapError(err)
		}
		return &MovieOutput{Body: toMovieBody(movie)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID: "update-movie",
		Method:      "PUT",
		Path:        "/api/movies/{id}",
		Summary:     "Replace a movie",
		Description: "Replaces the movie stored under the given id.",
		Tags:        []string{"movies"},
	}, func(ctx context.Context, input *UpdateMovieInput) (*MovieOutput, error) {
		log.Info("put movie")

		updated, err := movies.UpdateMovie(ctx, input.ID, domain.Movie{Name: input.Body.Name})
		if err != nil {
			return nil, mapError(err)
		}
		return &MovieOutput{Body: toMovieBody(updated)}, nil
	})

	huma.Register(api, huma.Operation{
		OperationID:   "delete-movie",
		Method:        "DELETE",
		Path:          "/api/movies/{id}",
		Summary:       "Delete a movie",
		Description:   "Removes a movie from the catalogue. Deleting an absent movie succeeds.",
		Tags:          []string{"movies"},
		DefaultStatus: 204,
	}, func(ctx context.Context, input *movieIDInput) (*NoContentOutput, error) {
		log.Info("delete movie")

		if err := movies.DeleteMovie(ctx, input.ID); err != nil {
			return nil, mapError(err)
		}
		return &NoContentOutput{}, nil
	})
}
