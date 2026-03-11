import type { Track } from "../types";
import CopyButton from "./CopyButton";
import Spinner from "./Spinner";

interface Props {
  tracks: Track[];
  selectedTrack: number | null;
  onSelectTrack: (index: number) => void;
  loading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  canGenerate: boolean;
}

export default function SetlistView({
  tracks,
  selectedTrack,
  onSelectTrack,
  loading,
  onGenerate,
  onReset,
  canGenerate,
}: Props) {
  const setlistText = tracks
    .map(
      (t) =>
        `${t.number}. ${t.title} (${t.genre}, ${t.vibe}, ${t.bpm}BPM, ${t.key})`
    )
    .join("\n");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-border mb-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          셋리스트
        </h3>
        <div className="flex items-center gap-1">
          {tracks.length > 0 && <CopyButton text={setlistText} label="전체 복사" />}
          {tracks.length > 0 && (
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
            <Spinner text="셋리스트 생성 중..." />
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            컨셉을 생성한 후 셋리스트를 생성해주세요
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <button
                key={track.number}
                onClick={() => onSelectTrack(idx)}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                  selectedTrack === idx
                    ? "bg-accent/20 border border-accent/40"
                    : "bg-bg-tertiary border border-transparent hover:bg-bg-hover hover:border-border"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-text-muted w-5 shrink-0">
                    {String(track.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {track.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-accent">{track.genre}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{track.vibe}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{track.bpm}BPM</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
