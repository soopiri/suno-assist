import { useState, useEffect, useRef } from "react";
import type {
  AlbumConcept,
  Track,
  LyricsResult,
  SunoPromptResult,
  ImagePromptResult,
} from "../types";
import {
  GenerateLyrics,
  GenerateSunoPrompt,
  GenerateImagePrompt,
  SelectDirectoryDialog,
  MkdirAll,
  WriteFile,
} from "../../wailsjs/go/main/App";

interface Props {
  open: boolean;
  onClose: () => void;
  concept: AlbumConcept;
  tracks: Track[];
  onComplete: (
    lyricsMap: Map<number, LyricsResult>,
    sunoPrompts: Map<number, SunoPromptResult>,
    imagePrompt: ImagePromptResult,
  ) => void;
}

type Phase = "idle" | "selecting" | "running" | "done" | "error";

export default function AutoGenerateModal({
  open,
  onClose,
  concept,
  tracks,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const cancelledRef = useRef(false);

  const totalStepsCount = tracks.length * 2 + 1 + 1; // lyrics + suno per track + image + write

  useEffect(() => {
    if (open && phase === "idle") {
      setTotalSteps(totalStepsCount);
      setProgress(0);
      setErrorMsg("");
      cancelledRef.current = false;
      startProcess();
    }
  }, [open]);

  const startProcess = async () => {
    setPhase("selecting");
    setStatusText("저장 폴더 선택...");

    let dir: string;
    try {
      dir = await SelectDirectoryDialog();
      if (!dir) {
        setPhase("idle");
        onClose();
        return;
      }
    } catch {
      setPhase("idle");
      onClose();
      return;
    }

    const today = new Date();
    const dateStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("");
    const folderName = `${dateStr}-${sanitizeFilename(concept.title)}`;
    const folderPath = `${dir}/${folderName}`;

    try {
      await MkdirAll(folderPath);
    } catch (e: any) {
      setErrorMsg(`폴더 생성 실패: ${e?.message || e}`);
      setPhase("error");
      return;
    }

    setPhase("running");

    const lyricsMap = new Map<number, LyricsResult>();
    const sunoMap = new Map<number, SunoPromptResult>();
    let step = 0;

    for (let i = 0; i < tracks.length; i++) {
      if (cancelledRef.current) return;

      const track = tracks[i];
      const label = `${i + 1}/${tracks.length} "${track.title}"`;

      setStatusText(`${label} 가사 생성 중...`);
      try {
        const lyrics = await GenerateLyrics(concept, track);
        lyricsMap.set(i, lyrics);
      } catch (e: any) {
        setErrorMsg(`${label} 가사 생성 실패: ${e?.message || e}`);
        setPhase("error");
        return;
      }
      step++;
      setProgress(step);

      if (cancelledRef.current) return;

      setStatusText(`${label} Suno 프롬프트 생성 중...`);
      const lyrics = lyricsMap.get(i)!;
      try {
        const suno = await GenerateSunoPrompt(concept, track, lyrics.lyrics);
        sunoMap.set(i, suno);
      } catch (e: any) {
        setErrorMsg(`${label} Suno 프롬프트 생성 실패: ${e?.message || e}`);
        setPhase("error");
        return;
      }
      step++;
      setProgress(step);
    }

    if (cancelledRef.current) return;

    setStatusText("이미지 프롬프트 생성 중...");
    let imgPrompt: ImagePromptResult;
    try {
      imgPrompt = await GenerateImagePrompt(concept, tracks);
    } catch (e: any) {
      setErrorMsg(`이미지 프롬프트 생성 실패: ${e?.message || e}`);
      setPhase("error");
      return;
    }
    step++;
    setProgress(step);

    if (cancelledRef.current) return;

    setStatusText("파일 저장 중...");
    try {
      await writeMdFiles(folderPath, concept, tracks, lyricsMap, sunoMap, imgPrompt);
    } catch (e: any) {
      setErrorMsg(`파일 저장 실패: ${e?.message || e}`);
      setPhase("error");
      return;
    }
    step++;
    setProgress(step);

    onComplete(lyricsMap, sunoMap, imgPrompt);
    setStatusText("완료!");
    setPhase("done");
  };

  const handleClose = () => {
    cancelledRef.current = true;
    setPhase("idle");
    onClose();
  };

  if (!open) return null;

  const pct = totalSteps > 0 ? Math.round((progress / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-bg-secondary border border-border p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          자동 생성
        </h2>

        <div className="min-h-[80px] flex flex-col justify-center">
          {phase === "selecting" && (
            <p className="text-sm text-text-secondary">{statusText}</p>
          )}

          {phase === "running" && (
            <>
              <p className="text-sm text-text-secondary mb-3">{statusText}</p>
              <div className="w-full bg-bg-tertiary rounded-full h-2 mb-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-text-muted text-right">
                {progress}/{totalSteps} ({pct}%)
              </p>
            </>
          )}

          {phase === "done" && (
            <p className="text-sm text-success">{statusText}</p>
          )}

          {phase === "error" && (
            <p className="text-sm text-error">{errorMsg}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {(phase === "done" || phase === "error") && (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              닫기
            </button>
          )}
          {phase === "running" && (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, " ").trim();
}

function padNum(n: number): string {
  return String(n).padStart(2, "0");
}

async function writeMdFiles(
  dir: string,
  concept: AlbumConcept,
  tracks: Track[],
  lyricsMap: Map<number, LyricsResult>,
  sunoMap: Map<number, SunoPromptResult>,
  imagePrompt: ImagePromptResult,
) {
  const conceptMd = `${concept.title}\n장르: ${concept.genre}\n바이브: ${concept.vibe}\n\n${concept.description}`;
  await WriteFile(`${dir}/00-1. Concept.md`, conceptMd);

  const setlistMd = tracks
    .map(
      (t) =>
        `${t.number}. ${t.title} (${t.genre}, ${t.vibe}, ${t.bpm}BPM, ${t.key})`,
    )
    .join("\n");
  await WriteFile(`${dir}/00-2. Set List.md`, setlistMd);

  await WriteFile(`${dir}/00-3. Album Image.md`, imagePrompt.prompt);

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const lyrics = lyricsMap.get(i);
    const suno = sunoMap.get(i);
    const content = `${lyrics?.lyrics || ""}\n\n---\n\nSuno Prompt\n${suno?.stylePrompt || ""}`;
    const filename = `${padNum(track.number)}. ${sanitizeFilename(track.title)}.md`;
    await WriteFile(`${dir}/${filename}`, content);
  }
}
