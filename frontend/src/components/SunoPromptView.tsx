import type { SunoPromptResult } from "../types";
import CopyButton from "./CopyButton";
import Spinner from "./Spinner";

interface Props {
  prompts: Map<number, SunoPromptResult>;
  selectedTrack: number | null;
  loading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onPromptChange: (field: "stylePrompt" | "lyricsPrompt", value: string) => void;
  canGenerate: boolean;
}

export default function SunoPromptView({
  prompts,
  selectedTrack,
  loading,
  onGenerate,
  onReset,
  onPromptChange,
  canGenerate,
}: Props) {
  const prompt =
    selectedTrack !== null ? prompts.get(selectedTrack) : undefined;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-border mb-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider truncate mr-2">
          Suno 프롬프트{prompt ? ` — ${prompt.trackTitle}` : ""}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {prompt && (
            <button
              onClick={onReset}
              className="px-2 py-1 rounded text-xs text-text-muted hover:text-error hover:bg-bg-hover transition-colors"
            >
              초기화
            </button>
          )}
          <button
            onClick={onGenerate}
            disabled={loading || !canGenerate}
            className="px-3 py-1 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-40 transition-colors"
          >
            {loading ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner text="Suno 프롬프트 생성 중..." />
          </div>
        ) : !prompt ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            곡을 선택하고 가사를 먼저 생성해주세요
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted">Style of Music</span>
                <CopyButton text={prompt.stylePrompt} label="복사" />
              </div>
              <textarea
                value={prompt.stylePrompt}
                onChange={(e) => onPromptChange("stylePrompt", e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-bg-tertiary border border-border p-3 text-sm text-text-primary leading-relaxed resize-none outline-none focus:border-border-focus transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted">Lyrics 메타태그</span>
                <CopyButton text={prompt.lyricsPrompt || ""} label="복사" />
              </div>
              <textarea
                value={prompt.lyricsPrompt || ""}
                onChange={(e) => onPromptChange("lyricsPrompt", e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-bg-tertiary border border-border p-3 text-sm text-text-primary leading-relaxed resize-none outline-none focus:border-border-focus transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
