package license

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"io"
	"time"
)

const trialDays = 5

type TrialStatus struct {
	Active   bool `json:"active"`
	DaysLeft int  `json:"daysLeft"`
	Expired  bool `json:"expired"`
}

func deriveAESKey(hwid string) []byte {
	h := sha256.Sum256([]byte("suno-assist-trial-v1:" + hwid))
	return h[:]
}

func encryptTrialData(key []byte, startTime, lastCheck time.Time) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plaintext := make([]byte, 16)
	binary.LittleEndian.PutUint64(plaintext[0:8], uint64(startTime.Unix()))
	binary.LittleEndian.PutUint64(plaintext[8:16], uint64(lastCheck.Unix()))

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	encrypted := gcm.Seal(nonce, nonce, plaintext, nil)
	return hex.EncodeToString(encrypted), nil
}

func decryptTrialData(key []byte, encoded string) (startTime, lastCheck time.Time, err error) {
	data, err := hex.DecodeString(encoded)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid trial data encoding")
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return time.Time{}, time.Time{}, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return time.Time{}, time.Time{}, fmt.Errorf("trial data too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("trial data corrupted: %w", err)
	}

	if len(plaintext) < 16 {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid trial data")
	}

	startUnix := int64(binary.LittleEndian.Uint64(plaintext[0:8]))
	lastUnix := int64(binary.LittleEndian.Uint64(plaintext[8:16]))

	return time.Unix(startUnix, 0), time.Unix(lastUnix, 0), nil
}

// evaluateTrial checks an existing trial data string and returns the status + updated data.
func evaluateTrial(hwid string, trialData string) (*TrialStatus, string) {
	aesKey := deriveAESKey(hwid)
	now := time.Now()

	startTime, lastCheck, err := decryptTrialData(aesKey, trialData)
	if err != nil {
		return &TrialStatus{Active: false, DaysLeft: 0, Expired: true}, trialData
	}

	if now.Before(lastCheck.Add(-1 * time.Minute)) {
		return &TrialStatus{Active: false, DaysLeft: 0, Expired: true}, trialData
	}

	elapsed := now.Sub(startTime)
	daysLeft := trialDays - int(elapsed.Hours()/24)
	if daysLeft < 0 {
		daysLeft = 0
	}

	updated, err := encryptTrialData(aesKey, startTime, now)
	if err != nil {
		updated = trialData
	}

	if daysLeft <= 0 {
		return &TrialStatus{Active: false, DaysLeft: 0, Expired: true}, updated
	}

	return &TrialStatus{Active: true, DaysLeft: daysLeft, Expired: false}, updated
}

// initTrial creates new trial data.
func initTrial(hwid string) (string, *TrialStatus, error) {
	aesKey := deriveAESKey(hwid)
	now := time.Now()

	data, err := encryptTrialData(aesKey, now, now)
	if err != nil {
		return "", nil, err
	}

	return data, &TrialStatus{Active: true, DaysLeft: trialDays, Expired: false}, nil
}
