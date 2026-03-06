package license

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os/exec"
	"runtime"
	"strings"
)

func GetHardwareID() (string, error) {
	var raw string
	var err error

	switch runtime.GOOS {
	case "darwin":
		raw, err = macosHWID()
	case "windows":
		raw, err = windowsHWID()
	case "linux":
		raw, err = linuxHWID()
	default:
		return "", fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}

	if err != nil {
		return "", fmt.Errorf("failed to get hardware ID: %w", err)
	}

	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:]), nil
}

func ShortHWID(hwid string) string {
	if len(hwid) > 16 {
		return hwid[:16]
	}
	return hwid
}

func macosHWID() (string, error) {
	out, err := exec.Command("ioreg", "-rd1", "-c", "IOPlatformExpertDevice").Output()
	if err != nil {
		return "", err
	}
	for _, line := range strings.Split(string(out), "\n") {
		if strings.Contains(line, "IOPlatformUUID") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				uuid := strings.TrimSpace(parts[1])
				uuid = strings.Trim(uuid, "\"")
				return uuid, nil
			}
		}
	}
	return "", fmt.Errorf("IOPlatformUUID not found")
}

func windowsHWID() (string, error) {
	// Method 1: Registry MachineGuid (most reliable, no external process)
	cmd := exec.Command("reg", "query",
		`HKLM\SOFTWARE\Microsoft\Cryptography`,
		"/v", "MachineGuid")
	cmd.SysProcAttr = windowsHideWindow()
	if out, err := cmd.Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			line = strings.TrimSpace(line)
			if strings.Contains(line, "MachineGuid") {
				parts := strings.Fields(line)
				if len(parts) >= 3 {
					guid := parts[len(parts)-1]
					if guid != "" {
						return guid, nil
					}
				}
			}
		}
	}

	// Method 2: PowerShell (Win32_ComputerSystemProduct UUID)
	cmd = exec.Command("powershell.exe", "-NoProfile", "-NonInteractive", "-Command",
		"(Get-CimInstance -Class Win32_ComputerSystemProduct).UUID")
	cmd.SysProcAttr = windowsHideWindow()
	if out, err := cmd.Output(); err == nil {
		uuid := strings.TrimSpace(string(out))
		if uuid != "" && uuid != "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF" {
			return uuid, nil
		}
	}

	// Method 3: wmic fallback
	cmd = exec.Command("cmd.exe", "/C", "wmic csproduct get UUID")
	cmd.SysProcAttr = windowsHideWindow()
	if out, err := cmd.Output(); err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			line = strings.TrimSpace(line)
			if line != "" && !strings.EqualFold(line, "UUID") {
				return line, nil
			}
		}
	}

	return "", fmt.Errorf("all methods failed to get Windows hardware ID")
}

func linuxHWID() (string, error) {
	out, err := exec.Command("cat", "/etc/machine-id").Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}
