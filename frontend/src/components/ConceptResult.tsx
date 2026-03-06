import type { AlbumConcept } from "../types";
import CopyButton from "./CopyButton";

interface Props {
  concept: AlbumConcept | null;
  loading: boolean;
  onChange: (concept: AlbumConcept) => void;
}

export default function ConceptResult({ concept, loading, onChange }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-text-muted text-sm py-3">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        컨셉 생성 중...
      </div>
    );
  }

  if (!concept) return null;

  const conceptText = `${concept.title}\n장르: ${concept.genre}\n분위기: ${concept.mood}\n\n${concept.description}`;

  const update = (field: keyof AlbumConcept, value: string) => {
    onChange({ ...concept, [field]: value });
  };

  return (
    <div className="h-full flex flex-col rounded-lg bg-bg-tertiary border border-border p-3 gap-2">
      <div className="shrink-0 flex items-start justify-between">
        <input
          value={concept.title}
          onChange={(e) => update("title", e.target.value)}
          className="text-sm font-semibold text-accent bg-transparent border-none outline-none w-full mr-2 focus:ring-0"
        />
        <CopyButton text={conceptText} label="복사" />
      </div>
      <div className="shrink-0 space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-text-muted shrink-0 w-10">장르</span>
          <input
            value={concept.genre}
            onChange={(e) => update("genre", e.target.value)}
            className="flex-1 text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-border-focus outline-none transition-colors py-0.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted shrink-0 w-10">분위기</span>
          <input
            value={concept.mood}
            onChange={(e) => update("mood", e.target.value)}
            className="flex-1 text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-border-focus outline-none transition-colors py-0.5"
          />
        </div>
      </div>
      <textarea
        value={concept.description}
        onChange={(e) => update("description", e.target.value)}
        className="flex-1 min-h-0 w-full text-xs text-text-secondary leading-relaxed bg-transparent border border-transparent hover:border-border focus:border-border-focus rounded outline-none transition-colors resize-none p-1"
      />
    </div>
  );
}
