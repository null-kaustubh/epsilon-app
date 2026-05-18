package envload

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func Load() {
	for _, dir := range findBackendEnvDirs() {
		_ = godotenv.Load(filepath.Join(dir, ".env.local"))
		_ = godotenv.Load(filepath.Join(dir, ".env"))
	}
}

func findBackendEnvDirs() []string {
	if d := os.Getenv("EPSILON_API_ENV_DIR"); d != "" {
		return []string{d}
	}

	wd, err := os.Getwd()
	if err != nil {
		return []string{"."}
	}

	var dirs []string
	if isBackendRoot(wd) {
		dirs = append(dirs, wd)
	}

	apiDir := filepath.Join(wd, "apps", "api-golang")
	if isBackendRoot(apiDir) {
		dirs = append(dirs, apiDir)
	}

	if len(dirs) == 0 {
		dirs = []string{wd, "."}
	}
	return dirs
}

func isBackendRoot(dir string) bool {
	_, err := os.Stat(filepath.Join(dir, "go.mod"))
	return err == nil
}
