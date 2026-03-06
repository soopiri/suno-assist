package license

import (
	"crypto/ed25519"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"os"
	"path/filepath"
)

const embeddedPublicKeyPEM = `-----BEGIN ED25519 PUBLIC KEY-----
kkjCu6jWVBwRabGs3iEnEAF42D2u4jBq2fjob0EkCpA=
-----END ED25519 PUBLIC KEY-----`

const (
	appDirName      = "suno-assist"
	licenseFileName = "license.json"
)

// licenseData is the on-disk format for license.json.
type licenseData struct {
	LicenseKey string `json:"licenseKey,omitempty"`
	Trial      string `json:"trial,omitempty"`
}

type AppStatus struct {
	Licensed  bool         `json:"licensed"`
	Trial     *TrialStatus `json:"trial"`
	License   *LicenseInfo `json:"license"`
	HWID      string       `json:"hwid"`
	ShortHWID string       `json:"shortHwid"`
}

type Manager struct {
	hwid      string
	publicKey ed25519.PublicKey
}

func NewManager() (*Manager, error) {
	hwid, err := GetHardwareID()
	if err != nil {
		return nil, fmt.Errorf("failed to get hardware ID: %w", err)
	}

	pubKey, err := parsePublicKey(embeddedPublicKeyPEM)
	if err != nil {
		return nil, fmt.Errorf("failed to parse embedded public key: %w", err)
	}

	return &Manager{hwid: hwid, publicKey: pubKey}, nil
}

func (m *Manager) GetStatus() *AppStatus {
	ld := m.loadData()

	// Check license key first
	if ld.LicenseKey != "" {
		if info, err := Verify(m.publicKey, ld.LicenseKey, m.hwid); err == nil && info.Valid {
			return &AppStatus{
				Licensed:  true,
				License:   info,
				HWID:      m.hwid,
				ShortHWID: ShortHWID(m.hwid),
			}
		}
	}

	// Check trial
	if ld.Trial != "" {
		trial, updatedData := evaluateTrial(m.hwid, ld.Trial)
		if updatedData != ld.Trial {
			ld.Trial = updatedData
			_ = m.saveData(ld)
		}
		return &AppStatus{
			Licensed:  false,
			Trial:     trial,
			HWID:      m.hwid,
			ShortHWID: ShortHWID(m.hwid),
		}
	}

	// No trial data — check OS marker before granting new trial
	if hasTrialMarker() {
		return &AppStatus{
			Licensed:  false,
			Trial:     &TrialStatus{Active: false, DaysLeft: 0, Expired: true},
			HWID:      m.hwid,
			ShortHWID: ShortHWID(m.hwid),
		}
	}

	// Genuine first launch → start trial
	trialData, trial, err := initTrial(m.hwid)
	if err != nil {
		return &AppStatus{
			Licensed:  false,
			Trial:     &TrialStatus{Active: false, DaysLeft: 0, Expired: true},
			HWID:      m.hwid,
			ShortHWID: ShortHWID(m.hwid),
		}
	}
	ld.Trial = trialData
	_ = m.saveData(ld)
	setTrialMarker()

	return &AppStatus{
		Licensed:  false,
		Trial:     trial,
		HWID:      m.hwid,
		ShortHWID: ShortHWID(m.hwid),
	}
}

func (m *Manager) ActivateLicense(key string) (*AppStatus, error) {
	info, err := Verify(m.publicKey, key, m.hwid)
	if err != nil {
		return nil, err
	}
	if !info.Valid {
		return nil, fmt.Errorf("license has expired")
	}

	ld := m.loadData()
	ld.LicenseKey = key
	if err := m.saveData(ld); err != nil {
		return nil, fmt.Errorf("failed to save license: %w", err)
	}

	return &AppStatus{
		Licensed:  true,
		License:   info,
		HWID:      m.hwid,
		ShortHWID: ShortHWID(m.hwid),
	}, nil
}

func (m *Manager) GetHWID() string {
	return m.hwid
}

func (m *Manager) GetShortHWID() string {
	return ShortHWID(m.hwid)
}

func dataPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, appDirName, licenseFileName), nil
}

func (m *Manager) loadData() licenseData {
	p, err := dataPath()
	if err != nil {
		return licenseData{}
	}
	raw, err := os.ReadFile(p)
	if err != nil {
		return licenseData{}
	}
	var ld licenseData
	if err := json.Unmarshal(raw, &ld); err != nil {
		return licenseData{}
	}
	return ld
}

func (m *Manager) saveData(ld licenseData) error {
	p, err := dataPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(p), 0700); err != nil {
		return err
	}
	raw, err := json.MarshalIndent(ld, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, raw, 0600)
}

func parsePublicKey(pemStr string) (ed25519.PublicKey, error) {
	block, _ := pem.Decode([]byte(pemStr))
	if block == nil {
		return nil, fmt.Errorf("invalid PEM")
	}
	if len(block.Bytes) != ed25519.PublicKeySize {
		return nil, fmt.Errorf("invalid public key size: %d", len(block.Bytes))
	}
	return ed25519.PublicKey(block.Bytes), nil
}
