import { useState, useCallback, useEffect } from "react";
import type {
  AlbumInput,
  AlbumConcept,
  Track,
  LyricsResult,
  SunoPromptResult,
  ImagePromptResult,
} from "./types";
import ConfigModal from "./components/ConfigModal";
import AlbumConceptPanel from "./components/AlbumConcept";
import ConceptResult from "./components/ConceptResult";
import SetlistView from "./components/SetlistView";
import LyricsView from "./components/LyricsView";
import SunoPromptView from "./components/SunoPromptView";
import ImagePromptView from "./components/ImagePromptView";
import LicenseGate from "./components/LicenseGate";
import AutoGenerateModal from "./components/AutoGenerateModal";
import {
  HasAPIKey,
  ExpandConcept,
  GenerateSetlist,
  GenerateLyrics,
  GenerateSunoPrompt,
  GenerateImagePrompt,
  SaveFileDialog,
  WriteFile,
  GetLicenseStatus,
  ActivateLicense,
} from "../wailsjs/go/main/App";
import type { license } from "../wailsjs/go/models";

function App() {
  const [licenseStatus, setLicenseStatus] = useState<license.AppStatus | null>(
    null,
  );
  const [licenseLoading, setLicenseLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    GetLicenseStatus()
      .then(setLicenseStatus)
      .catch(() => setLicenseStatus(null))
      .finally(() => setLicenseLoading(false));
    HasAPIKey().then(setApiConnected);
  }, []);

  const handleActivateLicense = useCallback(async (key: string) => {
    const result = await ActivateLicense(key);
    setLicenseStatus(result);
  }, []);

  const isUnlocked =
    licenseStatus?.licensed ||
    (licenseStatus?.trial?.active && !licenseStatus?.trial?.expired);

  const [input, setInput] = useState<AlbumInput>({
    idea: "",
    trackCount: 10,
    language: "Korean",
  });
  const [concept, setConcept] = useState<AlbumConcept | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);
  const [lyricsMap, setLyricsMap] = useState<Map<number, LyricsResult>>(
    new Map(),
  );
  const [sunoPrompts, setSunoPrompts] = useState<Map<number, SunoPromptResult>>(
    new Map(),
  );
  const [imagePrompt, setImagePrompt] = useState<ImagePromptResult | null>(
    null,
  );

  const [autoModalOpen, setAutoModalOpen] = useState(false);

  const [loadingConcept, setLoadingConcept] = useState(false);
  const [loadingSetlist, setLoadingSetlist] = useState(false);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [loadingSuno, setLoadingSuno] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    const has = await HasAPIKey();
    if (!has) {
      setConfigOpen(true);
      return false;
    }
    return true;
  }, []);

  // --- Generate handlers ---

  const handleExpandConcept = useCallback(async () => {
    if (!(await checkApiKey())) return;
    if (!input.idea.trim()) {
      setError("앨범 아이디어를 입력해주세요");
      return;
    }
    setError(null);
    setLoadingConcept(true);
    try {
      const result = await ExpandConcept(input);
      setConcept(result);
      setTracks([]);
      setSelectedTrack(null);
      setLyricsMap(new Map());
      setSunoPrompts(new Map());
      setImagePrompt(null);
    } catch (e: any) {
      setError(e?.message || "컨셉 생성 실패");
    } finally {
      setLoadingConcept(false);
    }
  }, [input, checkApiKey]);

  const handleGenerateSetlist = useCallback(async () => {
    if (!(await checkApiKey())) return;
    if (!concept) {
      setError("먼저 컨셉을 생성해주세요");
      return;
    }
    setError(null);
    setLoadingSetlist(true);
    try {
      const result = await GenerateSetlist(concept);
      setTracks(result.tracks);
      setSelectedTrack(null);
      setLyricsMap(new Map());
      setSunoPrompts(new Map());
      setImagePrompt(null);
    } catch (e: any) {
      setError(e?.message || "셋리스트 생성 실패");
    } finally {
      setLoadingSetlist(false);
    }
  }, [concept, checkApiKey]);

  const handleGenerateLyrics = useCallback(async () => {
    if (!(await checkApiKey())) return;
    if (selectedTrack === null || !concept) {
      setError("곡을 선택해주세요");
      return;
    }
    setError(null);
    setLoadingLyrics(true);
    try {
      const result = await GenerateLyrics(concept, tracks[selectedTrack]);
      setLyricsMap((prev) => new Map(prev).set(selectedTrack, result));
    } catch (e: any) {
      setError(e?.message || "가사 생성 실패");
    } finally {
      setLoadingLyrics(false);
    }
  }, [concept, tracks, selectedTrack, checkApiKey]);

  const handleGenerateSunoPrompt = useCallback(async () => {
    if (!(await checkApiKey())) return;
    if (selectedTrack === null || !concept) {
      setError("곡을 선택해주세요");
      return;
    }
    const lyrics = lyricsMap.get(selectedTrack);
    if (!lyrics) {
      setError("먼저 가사를 생성해주세요");
      return;
    }
    setError(null);
    setLoadingSuno(true);
    try {
      const result = await GenerateSunoPrompt(
        concept,
        tracks[selectedTrack],
        lyrics.lyrics,
      );
      setSunoPrompts((prev) => new Map(prev).set(selectedTrack, result));
    } catch (e: any) {
      setError(e?.message || "Suno 프롬프트 생성 실패");
    } finally {
      setLoadingSuno(false);
    }
  }, [concept, tracks, selectedTrack, lyricsMap, checkApiKey]);

  const handleGenerateImagePrompt = useCallback(async () => {
    if (!(await checkApiKey())) return;
    if (tracks.length === 0 || !concept) {
      setError("먼저 셋리스트를 생성해주세요");
      return;
    }
    setError(null);
    setLoadingImage(true);
    try {
      const result = await GenerateImagePrompt(concept, tracks);
      setImagePrompt(result);
    } catch (e: any) {
      setError(e?.message || "이미지 프롬프트 생성 실패");
    } finally {
      setLoadingImage(false);
    }
  }, [concept, tracks, checkApiKey]);

  const handleExportAll = useCallback(async () => {
    const exportData = {
      input,
      concept,
      tracks,
      lyrics: Object.fromEntries(lyricsMap),
      sunoPrompts: Object.fromEntries(sunoPrompts),
      imagePrompt,
    };
    try {
      const path = await SaveFileDialog(
        `${concept?.title || input.idea || "album"}.json`,
      );
      if (path) {
        await WriteFile(path, JSON.stringify(exportData, null, 2));
      }
    } catch (e: any) {
      setError(e?.message || "내보내기 실패");
    }
  }, [input, concept, tracks, lyricsMap, sunoPrompts, imagePrompt]);

  const handleAutoComplete = useCallback(
    (
      newLyrics: Map<number, LyricsResult>,
      newSuno: Map<number, SunoPromptResult>,
      newImage: ImagePromptResult,
    ) => {
      setLyricsMap(newLyrics);
      setSunoPrompts(newSuno);
      setImagePrompt(newImage);
    },
    [],
  );

  // --- Edit handlers ---

  const handleLyricsChange = useCallback(
    (text: string) => {
      if (selectedTrack === null) return;
      setLyricsMap((prev) => {
        const existing = prev.get(selectedTrack);
        if (!existing) return prev;
        return new Map(prev).set(selectedTrack, { ...existing, lyrics: text });
      });
    },
    [selectedTrack],
  );

  const handleSunoPromptChange = useCallback(
    (field: "stylePrompt", value: string) => {
      if (selectedTrack === null) return;
      setSunoPrompts((prev) => {
        const existing = prev.get(selectedTrack);
        if (!existing) return prev;
        return new Map(prev).set(selectedTrack, {
          ...existing,
          [field]: value,
        });
      });
    },
    [selectedTrack],
  );

  const handleImagePromptChange = useCallback((value: string) => {
    setImagePrompt((prev) => (prev ? { ...prev, prompt: value } : prev));
  }, []);

  // --- Reset handlers ---

  const resetSetlist = () => {
    setTracks([]);
    setSelectedTrack(null);
    setLyricsMap(new Map());
    setSunoPrompts(new Map());
    setImagePrompt(null);
  };

  const resetLyrics = () => {
    if (selectedTrack !== null) {
      setLyricsMap((prev) => {
        const next = new Map(prev);
        next.delete(selectedTrack);
        return next;
      });
      setSunoPrompts((prev) => {
        const next = new Map(prev);
        next.delete(selectedTrack);
        return next;
      });
    }
  };

  const resetSunoPrompt = () => {
    if (selectedTrack !== null) {
      setSunoPrompts((prev) => {
        const next = new Map(prev);
        next.delete(selectedTrack);
        return next;
      });
    }
  };

  const resetImagePrompt = () => {
    setImagePrompt(null);
  };

  const currentLyrics =
    selectedTrack !== null ? (lyricsMap.get(selectedTrack) ?? null) : null;
  const currentTrackTitle =
    selectedTrack !== null ? (tracks[selectedTrack]?.title ?? null) : null;
  const isAnyLoading =
    loadingConcept ||
    loadingSetlist ||
    loadingLyrics ||
    loadingSuno ||
    loadingImage;

  if (licenseLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <LicenseGate status={licenseStatus} onActivate={handleActivateLicense} />
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-primary">
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-bg-secondary/50 backdrop-blur-sm"
        style={{ WebkitAppRegion: "drag" } as any}
      >
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: "no-drag" } as any}
        >
          <h1 className="text-base font-bold text-text-primary tracking-tight">
            Suno Assist
          </h1>
          <span className="text-xs text-text-muted">Album Generator</span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" } as any}
        >
          {/* API status badge */}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              apiConnected
                ? "bg-success/20 text-success"
                : "bg-error/20 text-error"
            }`}
          >
            {apiConnected ? "API Connected" : "API 키를 입력하세요"}
          </span>
          {/* License status badge */}
          {licenseStatus && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                licenseStatus.licensed
                  ? "bg-success/20 text-success"
                  : "bg-warning/20 text-warning"
              }`}
            >
              {licenseStatus.licensed
                ? `Licensed ~ ${licenseStatus.license?.expiresAt}`
                : `Trial (${licenseStatus.trial?.daysLeft}d left)`}
            </span>
          )}
          {error && (
            <span className="text-xs text-error mr-2 max-w-[300px] truncate">
              {error}
            </span>
          )}
          <button
            onClick={() => setAutoModalOpen(true)}
            disabled={tracks.length === 0 || !concept || isAnyLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-30 transition-colors"
            title="전체 자동 생성 + 내보내기"
          >
            자동 생성
          </button>
          <button
            onClick={handleExportAll}
            disabled={tracks.length === 0}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover disabled:opacity-30 transition-colors"
            title="전체 내보내기"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setConfigOpen(true)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            title="API 설정"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - 4 Column Grid */}
      <main className="flex-1 grid grid-cols-[340px_1fr_1fr_1fr] gap-0 overflow-hidden">
        {/* Col 1 - Input & Concept */}
        <aside className="border-r border-border overflow-hidden p-4 flex flex-col gap-4">
          <div className="shrink-0">
            <AlbumConceptPanel input={input} onChange={setInput} />
          </div>

          <button
            onClick={handleExpandConcept}
            disabled={isAnyLoading || !input.idea.trim()}
            className="shrink-0 w-full py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {loadingConcept ? "컨셉 생성 중..." : "컨셉 생성"}
          </button>

          <div className="flex-1 min-h-0">
            <ConceptResult
              concept={concept}
              loading={loadingConcept}
              onChange={setConcept}
            />
          </div>
        </aside>

        {/* Col 2 - Setlist */}
        <div className="border-r border-border overflow-hidden p-4">
          <SetlistView
            tracks={tracks}
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
            loading={loadingSetlist}
            onGenerate={handleGenerateSetlist}
            onReset={resetSetlist}
            canGenerate={!!concept && !isAnyLoading}
          />
        </div>

        {/* Col 3 - Lyrics */}
        <div className="border-r border-border overflow-hidden p-4">
          <LyricsView
            lyrics={currentLyrics}
            loading={loadingLyrics}
            trackTitle={currentTrackTitle}
            onGenerate={handleGenerateLyrics}
            onReset={resetLyrics}
            onLyricsChange={handleLyricsChange}
            canGenerate={selectedTrack !== null && !isAnyLoading}
          />
        </div>

        {/* Col 4 - Suno Prompt + Image Prompt */}
        <div className="flex flex-col overflow-hidden">
          <div className="h-1/2 border-b border-border overflow-hidden p-4">
            <SunoPromptView
              prompts={sunoPrompts}
              selectedTrack={selectedTrack}
              loading={loadingSuno}
              onGenerate={handleGenerateSunoPrompt}
              onReset={resetSunoPrompt}
              onPromptChange={handleSunoPromptChange}
              canGenerate={
                selectedTrack !== null &&
                !!lyricsMap.get(selectedTrack!) &&
                !isAnyLoading
              }
            />
          </div>
          <div className="h-1/2 overflow-hidden p-4">
            <ImagePromptView
              imagePrompt={imagePrompt}
              loading={loadingImage}
              onGenerate={handleGenerateImagePrompt}
              onReset={resetImagePrompt}
              onPromptChange={handleImagePromptChange}
              canGenerate={tracks.length > 0 && !isAnyLoading}
            />
          </div>
        </div>
      </main>

      <ConfigModal
        open={configOpen}
        onClose={() => {
          setConfigOpen(false);
          HasAPIKey().then(setApiConnected);
        }}
        onLicenseActivated={setLicenseStatus}
      />

      {concept && tracks.length > 0 && (
        <AutoGenerateModal
          open={autoModalOpen}
          onClose={() => setAutoModalOpen(false)}
          concept={concept}
          tracks={tracks}
          onComplete={handleAutoComplete}
        />
      )}
    </div>
  );
}

export default App;
