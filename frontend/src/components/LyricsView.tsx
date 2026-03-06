import type { LyricsResult } from "../types";
import CopyButton from "./CopyButton";
import Spinner from "./Spinner";

interface Props {
  lyrics: LyricsResult | null;
  loading: boolean;
  trackTitle: string | null;
  onGenerate: () => void;
  onReset: () => void;
  onLyricsChange: (lyrics: string) => void;
  canGenerate: boolean;
}

export default function LyricsView({
  lyrics,
  loading,
  trackTitle,
  onGenerate,
  onReset,
  onLyricsChange,
  canGenerate,
}: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-border mb-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider truncate mr-2">
          가사{lyrics ? ` — ${lyrics.trackTitle}` : ""}
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {lyrics && <CopyButton text={lyrics.lyrics} label="복사" />}
          {lyrics && (
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

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner text="가사 생성 중..." />
          </div>
        ) : !lyrics ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            {trackTitle
              ? `"${trackTitle}" 가사를 생성해주세요`
              : "셋리스트에서 곡을 선택해주세요"}
          </div>
        ) : (
          <textarea
            value={lyrics.lyrics}
            onChange={(e) => onLyricsChange(e.target.value)}
            className="h-full w-full overflow-y-auto rounded-lg bg-bg-tertiary border border-border p-3 text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed resize-none outline-none focus:border-border-focus transition-colors"
          />
        )}
      </div>
    </div>
  );
}
