package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"
)

const keyPrefix = "SA-"

type LicensePayload struct {
	HWID string `json:"hwid"`
	IAT  int64  `json:"iat"`
	EXP  int64  `json:"exp"`
}

type LicenseInfo struct {
	Valid     bool   `json:"valid"`
	ExpiresAt string `json:"expiresAt"`
	DaysLeft  int    `json:"daysLeft"`
}

// Sign creates a license key from a payload using the private key.
func Sign(privateKey ed25519.PrivateKey, payload LicensePayload) (string, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal payload: %w", err)
	}

	sig := ed25519.Sign(privateKey, payloadBytes)

	combined := append(payloadBytes, sig...)
	encoded := base64.RawURLEncoding.EncodeToString(combined)

	return keyPrefix + encoded, nil
}

// Verify validates a license key against the public key and hardware ID.
func Verify(publicKey ed25519.PublicKey, licenseKey string, currentHWID string) (*LicenseInfo, error) {
	if len(licenseKey) <= len(keyPrefix) {
		return nil, fmt.Errorf("invalid license key format")
	}

	encoded := licenseKey[len(keyPrefix):]
	combined, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return nil, fmt.Errorf("invalid license key encoding: %w", err)
	}

	if len(combined) <= ed25519.SignatureSize {
		return nil, fmt.Errorf("invalid license key length")
	}

	payloadBytes := combined[:len(combined)-ed25519.SignatureSize]
	sig := combined[len(combined)-ed25519.SignatureSize:]

	if !ed25519.Verify(publicKey, payloadBytes, sig) {
		return nil, fmt.Errorf("invalid license key signature")
	}

	var payload LicensePayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, fmt.Errorf("invalid license key data: %w", err)
	}

	if payload.HWID != currentHWID {
		return nil, fmt.Errorf("license key is not valid for this machine")
	}

	now := time.Now()
	expiresAt := time.Unix(payload.EXP, 0)
	daysLeft := int(time.Until(expiresAt).Hours() / 24)
	if daysLeft < 0 {
		daysLeft = 0
	}

	return &LicenseInfo{
		Valid:     now.Before(expiresAt),
		ExpiresAt: expiresAt.Format("2006-01-02"),
		DaysLeft:  daysLeft,
	}, nil
}
