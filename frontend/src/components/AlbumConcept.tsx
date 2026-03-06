import type { AlbumInput } from "../types";

interface Props {
  input: AlbumInput;
  onChange: (input: AlbumInput) => void;
}

export default function AlbumConcept({ input, onChange }: Props) {
  const update = (field: keyof AlbumInput, value: string | number) => {
    onChange({ ...input, [field]: value });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        앨범 아이디어
      </h3>

      <div>
        <label className="block text-xs text-text-muted mb-1">
          컨셉 / 주제
        </label>
        <textarea
          value={input.idea}
          onChange={(e) => update("idea", e.target.value)}
          placeholder={"앨범 컨셉 또는 요청사항을 입력하세요"}
          rows={5}
          className="w-full rounded-lg bg-bg-tertiary border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-text-muted mb-1">곡 수</label>
          <input
            type="number"
            min={1}
            max={20}
            value={input.trackCount}
            onChange={(e) =>
              update("trackCount", parseInt(e.target.value) || 1)
            }
            className="w-full rounded-lg bg-bg-tertiary border border-border px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">
            가사 언어
          </label>
          <div className="relative">
            <select
              value={input.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full appearance-none rounded-lg bg-bg-tertiary border border-border px-3 py-2 pr-8 text-sm text-text-primary focus:border-border-focus focus:outline-none transition-colors"
            >
              <option value="Korean">한국어</option>
              <option value="English">영어</option>
              <option value="Japanese">일본어</option>
              <option value="Mixed Korean/English">한영 혼합</option>
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
