package main

import (
	"context"
	"fmt"

	"suno-assist/internal/config"
	"suno-assist/internal/generator"
	"suno-assist/internal/license"
	oai "suno-assist/internal/openai"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx        context.Context
	cfg        *config.Config
	aiClient   *oai.Client
	licMgr     *license.Manager
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	cfg, err := config.Load()
	if err != nil {
		cfg = &config.Config{OpenAIModel: "gpt-5.4"}
	}
	a.cfg = cfg
	a.aiClient = oai.NewClient(cfg.OpenAIAPIKey, cfg.OpenAIModel)

	mgr, err := license.NewManager()
	if err != nil {
		fmt.Printf("License manager init error: %v\n", err)
	}
	a.licMgr = mgr
}

// --- Config ---

func (a *App) GetConfig() *config.Config {
	return a.cfg
}

func (a *App) SaveConfig(apiKey string, model string) error {
	a.cfg.OpenAIAPIKey = apiKey
	if model != "" {
		a.cfg.OpenAIModel = model
	}
	a.aiClient.UpdateConfig(a.cfg.OpenAIAPIKey, a.cfg.OpenAIModel)
	return config.Save(a.cfg)
}

func (a *App) HasAPIKey() bool {
	return a.cfg != nil && a.cfg.OpenAIAPIKey != ""
}

func (a *App) ValidateAPIKey(apiKey string, model string) error {
	if apiKey == "" {
		return fmt.Errorf("API Key를 입력해주세요")
	}
	if model == "" {
		model = "gpt-5.4"
	}
	tmp := oai.NewClient(apiKey, model)
	_, err := tmp.ChatCompletion(a.ctx, "Reply with OK", "test")
	if err != nil {
		return fmt.Errorf("API Key 검증 실패: %v", err)
	}
	return nil
}

// --- Generator ---

func (a *App) ExpandConcept(input generator.AlbumInput) (*generator.AlbumConcept, error) {
	return generator.ExpandConcept(a.ctx, a.aiClient, input)
}

func (a *App) GenerateSetlist(concept generator.AlbumConcept) (*generator.SetlistResult, error) {
	return generator.GenerateSetlist(a.ctx, a.aiClient, concept)
}

func (a *App) GenerateLyrics(concept generator.AlbumConcept, track generator.Track) (*generator.LyricsResult, error) {
	return generator.GenerateLyrics(a.ctx, a.aiClient, concept, track)
}

func (a *App) GenerateSunoPrompt(concept generator.AlbumConcept, track generator.Track, lyrics string) (*generator.SunoPromptResult, error) {
	return generator.GenerateSunoPrompt(a.ctx, a.aiClient, concept, track, lyrics)
}

func (a *App) GenerateImagePrompt(concept generator.AlbumConcept, tracks []generator.Track) (*generator.ImagePromptResult, error) {
	return generator.GenerateImagePrompt(a.ctx, a.aiClient, concept, tracks)
}

// --- File Export ---

func (a *App) SaveFileDialog(defaultFilename string) (string, error) {
	return wailsRuntime.SaveFileDialog(a.ctx, wailsRuntime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Filters: []wailsRuntime.FileFilter{
			{DisplayName: "JSON Files", Pattern: "*.json"},
			{DisplayName: "Text Files", Pattern: "*.txt"},
			{DisplayName: "All Files", Pattern: "*.*"},
		},
	})
}

func (a *App) WriteFile(path string, content string) error {
	return writeFile(path, content)
}

// --- License ---

func (a *App) GetLicenseStatus() *license.AppStatus {
	if a.licMgr == nil {
		return &license.AppStatus{
			Licensed: false,
			Trial:    &license.TrialStatus{Active: false, DaysLeft: 0, Expired: true},
		}
	}
	return a.licMgr.GetStatus()
}

func (a *App) ActivateLicense(key string) (*license.AppStatus, error) {
	if a.licMgr == nil {
		return nil, fmt.Errorf("license manager not initialized")
	}
	return a.licMgr.ActivateLicense(key)
}

func (a *App) GetHWID() string {
	if a.licMgr == nil {
		hwid, err := license.GetHardwareID()
		if err != nil {
			return "ERROR: " + err.Error()
		}
		return hwid
	}
	return a.licMgr.GetHWID()
}

func (a *App) GetShortHWID() string {
	if a.licMgr == nil {
		return ""
	}
	return a.licMgr.GetShortHWID()
}
