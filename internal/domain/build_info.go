package domain

// BuildInfo describes the binary currently serving traffic. The values are
// stamped in at link time by the build.
type BuildInfo struct {
	BuildDate  string
	GitBranch  string
	GitCommit  string
	GitState   string
	GitSummary string
}
