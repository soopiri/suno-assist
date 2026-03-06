package license

import "syscall"

func windowsHideWindow() *syscall.SysProcAttr {
	return &syscall.SysProcAttr{
		CreationFlags: 0x08000000,
	}
}
