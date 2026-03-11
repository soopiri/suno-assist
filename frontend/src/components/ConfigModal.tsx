import { useState, useEffect } from "react";
import {
  GetConfig,
  SaveConfig,
  GetHWID,
  ActivateLicense,
  ValidateAPIKey,
} from "../../wailsjs/go/main/App";
import type { license } from "../../wailsjs/go/models";

interface Props {
  open: boolean;
  onClose: () => void;
  onLicenseActivated?: (status: license.AppStatus) => void;
}

export default function ConfigModal({
  open,
  onClose,
  onLicenseActivated,
}: Props) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-5.4");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hwid, setHwid] = useState("");
  const [hwidCopied, setHwidCopied] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [licenseSuccess, setLicenseSuccess] = useState("");
  const [activating, setActivating] = useState(false);
  const [apiChecked, setApiChecked] = useState(false);
  const [apiChecking, setApiChecking] = useState(false);
  const [apiCheckMsg, setApiCheckMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [originalKey, setOriginalKey] = useState("");

  useEffect(() => {
    if (open) {
      GetConfig().then((cfg) => {
        const key = cfg.openai_api_key || "";
        setApiKey(key);
        setOriginalKey(key);
        setModel(cfg.openai_model || "gpt-5.4");
        setApiChecked(!!key);
        setApiCheckMsg(null);
        setError("");
      });
      GetHWID()
        .then(setHwid)
        .catch(() => {});
    }
  }, [open]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (val !== originalKey) {
      setApiChecked(false);
      setApiCheckMsg(null);
    } else if (val) {
      setApiChecked(true);
    }
  };

  const handleCheck = async () => {
    if (!apiKey.trim()) {
      setApiCheckMsg({ ok: false, text: "API Key를 입력해주세요" });
      return;
    }
    setApiChecking(true);
    setApiCheckMsg(null);
    try {
      await ValidateAPIKey(apiKey.trim(), model);
      setApiChecked(true);
      setApiCheckMsg({ ok: true, text: "API Key 확인 완료" });
    } catch (e: any) {
      setApiChecked(false);
      setApiCheckMsg({
        ok: false,
        text: e?.message || "API Key가 유효하지 않습니다",
      });
    } finally {
      setApiChecking(false);
    }
  };

  const handleCopyHWID = () => {
    navigator.clipboard.writeText(hwid);
    setHwidCopied(true);
    setTimeout(() => setHwidCopied(false), 2000);
  };

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) return;
    setLicenseError("");
    setLicenseSuccess("");
    setActivating(true);
    try {
      const result = await ActivateLicense(licenseKey.trim());
      setLicenseSuccess(
        `라이센스 활성화 완료 (만료: ${result.license?.expiresAt})`,
      );
      setLicenseKey("");
      onLicenseActivated?.(result);
    } catch (e: any) {
      setLicenseError(e?.message || "라이센스 키가 유효하지 않습니다");
    } finally {
      setActivating(false);
    }
  };

  if (!open) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("API Key를 입력해주세요");
      return;
    }
    if (!apiChecked) {
      setError("먼저 API Key를 Check 해주세요");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await SaveConfig(apiKey.trim(), model);
      onClose();
    } catch (e: any) {
      setError(e?.message || "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary border border-border p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-text-primary mb-4">설정</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className="flex-1 rounded-lg bg-bg-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleCheck}
                disabled={apiChecking || !apiKey.trim()}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  apiChecked
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                } disabled:opacity-50`}
              >
                {apiChecking ? "확인 중..." : apiChecked ? "Checked" : "Check"}
              </button>
            </div>
            {apiCheckMsg && (
              <p
                className={`text-[11px] mt-1 ${apiCheckMsg.ok ? "text-success" : "text-error"}`}
              >
                {apiCheckMsg.text}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              모델
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg bg-bg-tertiary border border-border px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none transition-colors"
            >
              <option value="gpt-5.4">GPT-5.4</option>
              <option value="gpt-5-mini">GPT-5 Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
          </div>

          <div className="pt-3 mt-1 border-t border-border">
            <label className="block text-sm text-text-secondary mb-1.5">
              Machine ID (HWID)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={hwid}
                className="flex-1 rounded-lg bg-bg-primary border border-border px-3 py-2 text-xs text-text-secondary font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyHWID}
                className="shrink-0 px-3 py-2 rounded-lg bg-bg-tertiary border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors whitespace-nowrap"
              >
                {hwidCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              라이센스 발급 요청 시 이 ID를 전달해주세요
            </p>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              License Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="SA-..."
                className="flex-1 rounded-lg bg-bg-tertiary border border-border px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted/50 focus:border-border-focus focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleActivateLicense}
                disabled={activating || !licenseKey.trim()}
                className="shrink-0 px-3 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {activating ? "확인 중..." : "활성화"}
              </button>
            </div>
            {licenseError && (
              <p className="text-[11px] text-error mt-1">{licenseError}</p>
            )}
            {licenseSuccess && (
              <p className="text-[11px] text-success mt-1">{licenseSuccess}</p>
            )}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !apiChecked}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
