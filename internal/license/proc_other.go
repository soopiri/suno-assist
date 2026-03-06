//go:build !windows

package license

import "syscall"

func windowsHideWindow() *syscall.SysProcAttr {
	return nil
}
