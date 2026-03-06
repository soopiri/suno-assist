import { useState, useEffect } from "react";
import { GetHWID } from "../../wailsjs/go/main/App";
import type { license } from "../../wailsjs/go/models";

interface Props {
  status: license.AppStatus | null;
  onActivate: (key: string) => Promise<void>;
}

export default function LicenseGate({ status, onActivate }: Props) {
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hwid, setHwid] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    GetHWID().then(setHwid).catch(() => {});
  }, []);

  const handleCopyHWID = () => {
    navigator.clipboard.writeText(hwid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onActivate(licenseKey.trim());
    } catch (err: any) {
      setError(err?.message || "라이센스 키가 유효하지 않습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Suno Assist
          </h1>
          <p className="text-text-muted text-sm">Album Generator</p>
        </div>

        <div className="bg-bg-secondary rounded-xl border border-border p-6 space-y-6">
          {/* Status message */}
          <div className="text-center">
            {status?.trial?.expired ? (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error/10 text-error text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  체험 기간이 만료되었습니다
                </div>
                <p className="text-text-muted text-xs">
                  계속 사용하려면 라이센스 키를 입력해주세요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  라이센스가 필요합니다
                </div>
              </div>
            )}
          </div>

          {/* HWID section */}
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Machine ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={hwid}
                className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-xs text-text-secondary font-mono select-all"
              />
              <button
                onClick={handleCopyHWID}
                className="shrink-0 px-3 py-2 rounded-lg bg-bg-tertiary border border-border text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              라이센스 발급 시 이 ID를 전달해주세요
            </p>
          </div>

          {/* License key input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1.5">License Key</label>
              <textarea
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="SA-xxxxxxxx..."
                rows={3}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted/50 focus:outline-none focus:border-border-focus resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !licenseKey.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "확인 중..." : "라이센스 활성화"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
