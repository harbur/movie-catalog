// Command golang-gin-starter serves the movies API.
//
// This file is wiring only: read config, construct adapters, inject them, serve.
package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"

	adapterhttp "github.com/harbur/golang-gin-starter/internal/adapters/http"
	"github.com/harbur/golang-gin-starter/internal/adapters/memory"
	"github.com/harbur/golang-gin-starter/internal/adapters/metrics"
	"github.com/harbur/golang-gin-starter/internal/app"
	"github.com/harbur/golang-gin-starter/internal/config"
	"github.com/harbur/golang-gin-starter/internal/domain"
)

// Build information, stamped in at link time.
var (
	version    = "1.0.0"
	buildDate  string
	gitBranch  string
	gitCommit  string
	gitState   string
	gitSummary string
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	registry := prometheus.NewRegistry()
	actions, err := metrics.NewPrometheus(registry)
	if err != nil {
		return err
	}

	buildInfo := domain.BuildInfo{
		BuildDate:  buildDate,
		GitBranch:  gitBranch,
		GitCommit:  gitCommit,
		GitState:   gitState,
		GitSummary: gitSummary,
	}

	movies := app.NewMovieService(memory.NewMovieRepository(), actions)
	health := app.NewHealthService(buildInfo)

	handler := adapterhttp.NewHandler(adapterhttp.Options{
		Title:    "Golang Starter",
		Version:  version,
		Gatherer: registry,
	}, movies, health)

	server := &http.Server{
		Addr:              cfg.Server.Addr(),
		Handler:           handler,
		ReadHeaderTimeout: 10 * time.Second,
	}

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	serveErr := make(chan error, 1)
	go func() {
		log.Infof("listening on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serveErr <- err
			return
		}
		serveErr <- nil
	}()

	select {
	case err := <-serveErr:
		return err
	case <-shutdown:
		log.Info("shutting down")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return server.Shutdown(ctx)
	}
}
