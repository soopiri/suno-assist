import type { ImagePromptResult } from "../types";
import CopyButton from "./CopyButton";
import Spinner from "./Spinner";

interface Props {
  imagePrompt: ImagePromptResult | null;
  loading: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onPromptChange: (value: string) => void;
  canGenerate: boolean;
}

export default function ImagePromptView({
  imagePrompt,
  loading,
  onGenerate,
  onReset,
  onPromptChange,
  canGenerate,
}: Props) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-border mb-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          앨범 이미지 (Gemini Prompt 생성 보조)
        </h3>
        <div className="flex items-center gap-1 shrink-0">
          {imagePrompt && <CopyButton text={imagePrompt.prompt} label="복사" />}
          {imagePrompt && (
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
            <Spinner text="이미지 프롬프트 생성 중..." />
          </div>
        ) : !imagePrompt ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            셋리스트 생성 후 이미지 프롬프트를 생성해주세요
          </div>
        ) : (
          <textarea
            value={imagePrompt.prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="h-full w-full overflow-y-auto rounded-lg bg-bg-tertiary border border-border p-3 text-sm text-text-primary leading-relaxed resize-none outline-none focus:border-border-focus transition-colors"
          />
        )}
      </div>
    </div>
  );
}
