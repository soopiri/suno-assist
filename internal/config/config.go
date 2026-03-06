package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

const configDir = "suno-assist"
const configFile = "config.json"

type Config struct {
	OpenAIAPIKey string `json:"openai_api_key"`
	OpenAIModel  string `json:"openai_model"`
}

func configPath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, configDir, configFile), nil
}

func Load() (*Config, error) {
	p, err := configPath()
	if err != nil {
		return nil, err
	}

	data, err := os.ReadFile(p)
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{OpenAIModel: "gpt-4o"}, nil
		}
		return nil, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	if cfg.OpenAIModel == "" {
		cfg.OpenAIModel = "gpt-4o"
	}
	return &cfg, nil
}

func Save(cfg *Config) error {
	p, err := configPath()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(filepath.Dir(p), 0700); err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, data, 0600)
}
