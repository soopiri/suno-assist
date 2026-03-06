package license

import (
	"os/exec"
	"runtime"
	"strings"
)

const (
	keychainService = "com.suno-assist.trial"
	keychainAccount = "trial-marker"
	registryPath    = `HKCU\Software\SunoAssist`
	registryKey     = "TrialMarker"
)

// setTrialMarker stores a marker in the OS native store.
func setTrialMarker() {
	switch runtime.GOOS {
	case "darwin":
		setKeychainMarker()
	case "windows":
		setRegistryMarker()
	}
}

// hasTrialMarker checks if a trial marker exists in the OS native store.
func hasTrialMarker() bool {
	switch runtime.GOOS {
	case "darwin":
		return hasKeychainMarker()
	case "windows":
		return hasRegistryMarker()
	default:
		return false
	}
}

// --- macOS Keychain ---

func setKeychainMarker() {
	_ = exec.Command("security", "delete-generic-password",
		"-s", keychainService, "-a", keychainAccount).Run()

	_ = exec.Command("security", "add-generic-password",
		"-s", keychainService, "-a", keychainAccount,
		"-w", "1", "-U").Run()
}

func hasKeychainMarker() bool {
	out, err := exec.Command("security", "find-generic-password",
		"-s", keychainService, "-a", keychainAccount, "-w").Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) != ""
}

// --- Windows Registry ---

func setRegistryMarker() {
	cmd := exec.Command("reg", "add", registryPath,
		"/v", registryKey, "/t", "REG_SZ", "/d", "1", "/f")
	cmd.SysProcAttr = windowsHideWindow()
	_ = cmd.Run()
}

func hasRegistryMarker() bool {
	cmd := exec.Command("reg", "query", registryPath,
		"/v", registryKey)
	cmd.SysProcAttr = windowsHideWindow()
	out, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.Contains(string(out), registryKey)
}
