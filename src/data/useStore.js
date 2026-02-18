import { useState, useEffect, useCallback, useRef } from "react";
import { chapters as defaultChapters } from "./photos";
import { normalizeMediaItems, GITHUB_CONFIG, pushToGitHub } from "./githubSync";

export function normalizePhoto(photo) {
  return { ...photo, mediaItems: normalizeMediaItems(photo) };
}

export function normalizeChapter(chapter) {
  return { ...chapter, photos: (chapter.photos || []).map(normalizePhoto) };
}

// Data loading logic simplified to prioritize photos.js
function loadData() {
  // Selalu gunakan data murni dari photos.js agar sinkron antar perangkat
  return defaultChapters.map(normalizeChapter);
}

let globalChapters = loadData();
let listeners = [];
function notify() {
  listeners.forEach((fn) => fn([...globalChapters]));
}

// Single polling instance to prevent multiple intervals
let isPollingStarted = false;
let jsonMissingGlobal = false;

function startPolling() {
  if (isPollingStarted) return;
  isPollingStarted = true;

  const fetchUpdates = async () => {
    try {
      const { owner, repo, branch, getToken, filePath } = GITHUB_CONFIG;
      const token = getToken();
      let fetchedData = null;

      // Try JSON first (only if not already failing with 404)
      const jsonPath = "src/data/photos.json";
      if (!jsonMissingGlobal) {
        // Check if JSON exists via Commits API first (to avoid console 404)
        const checkRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?path=${jsonPath}&sha=${branch}&per_page=1`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const commits = checkRes.ok ? await checkRes.json() : [];
        const exists = Array.isArray(commits) && commits.length > 0;

        if (exists) {
          const res = await fetch(
            token
              ? `https://api.github.com/repos/${owner}/${repo}/contents/${jsonPath}?ref=${branch}`
              : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${jsonPath}`,
            {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.v3.raw",
                  }
                : {},
            },
          );

          if (res.ok) {
            fetchedData = await res.json();
          }
        } else {
          jsonMissingGlobal = true; // Avoid re-checking if we know it's not there
        }
      }

      // If JSON failed/missing or we know it's missing, try parsing the JS file
      if (!fetchedData) {
        const jsRes = await fetch(
          token
            ? `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`
            : `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github.v3.raw",
                }
              : {},
          },
        );
        if (jsRes.ok) {
          const text = await jsRes.text();
          const match = text.match(/export const chapters = (\[[\s\S]*?\]);/);
          if (match) {
            fetchedData = new Function(`return ${match[1]}`)();
          }
        }
      }

      if (fetchedData && Array.isArray(fetchedData)) {
        const normalized = fetchedData.map(normalizeChapter);
        if (JSON.stringify(normalized) !== JSON.stringify(globalChapters)) {
          globalChapters = normalized;
          notify();
        }
      }
    } catch (e) {
      // Silent fail
    }
  };

  fetchUpdates();
  setInterval(fetchUpdates, 30000);
}

export function useStore() {
  const [chapters, setChapters] = useState(globalChapters);

  useEffect(() => {
    const handler = (data) => setChapters(data);
    listeners.push(handler);
    startPolling(); // Ensure polling is active
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  // Wrap automated push logic
  const autoSync = useCallback(async (currentChapters) => {
    try {
      const token = GITHUB_CONFIG.getToken();
      if (!token) return null;

      // Dispatch "syncing" status so UI can show initial loading
      window.dispatchEvent(
        new CustomEvent("github-sync-status", {
          detail: { status: "syncing", timestamp: Date.now() },
        }),
      );

      const result = await pushToGitHub(currentChapters);

      // We wait a tiny bit to make sure the user sees the "Processing" state
      // before showing the Vercel Tracker
      setTimeout(() => {
        const event = new CustomEvent("github-sync-status", {
          detail: {
            status: "success",
            timestamp: Date.now(),
            commitSha: result.commitSha,
          },
        });
        window.dispatchEvent(event);
      }, 500);

      return result;
    } catch (e) {
      console.error("Auto-sync failed:", e);
      // We check if the result was actually returned before the error (shouldn't happen with await)
      // but the main issue is githubSync catch block.
      // If we are here, it means pushToGitHub threw an exception.
      const event = new CustomEvent("github-sync-status", {
        detail: { status: "error", message: e.message, timestamp: Date.now() },
      });
      window.dispatchEvent(event);
      throw e;
    }
  }, []);

  const addChapter = useCallback(
    async (chapter) => {
      const newChapter = {
        ...chapter,
        id: chapter.slug || chapter.label.toLowerCase().replace(/\s+/g, "-"),
        hidden: false,
        photos: [],
      };
      const nextChapters = [...globalChapters, newChapter];
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const updateChapter = useCallback(
    async (id, updates) => {
      const nextChapters = globalChapters.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const deleteChapter = useCallback(
    async (id) => {
      const nextChapters = globalChapters.filter((c) => c.id !== id);
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const toggleChapterHidden = useCallback(
    async (id) => {
      const nextChapters = globalChapters.map((c) =>
        c.id === id ? { ...c, hidden: !c.hidden } : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const addPhoto = useCallback(
    async (chapterId, photo) => {
      const newPhoto = normalizePhoto({
        ...photo,
        id: Date.now() + Math.random(),
        hidden: false,
      });
      const nextChapters = globalChapters.map((c) =>
        c.id === chapterId ? { ...c, photos: [...c.photos, newPhoto] } : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const updatePhoto = useCallback(
    async (chapterId, photoId, updates) => {
      const nextChapters = globalChapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              photos: c.photos.map((p) =>
                p.id === photoId ? normalizePhoto({ ...p, ...updates }) : p,
              ),
            }
          : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const deletePhoto = useCallback(
    async (chapterId, photoId) => {
      const nextChapters = globalChapters.map((c) =>
        c.id === chapterId
          ? { ...c, photos: c.photos.filter((p) => p.id !== photoId) }
          : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const togglePhotoHidden = useCallback(
    async (chapterId, photoId) => {
      const nextChapters = globalChapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              photos: c.photos.map((p) =>
                p.id === photoId ? { ...p, hidden: !p.hidden } : p,
              ),
            }
          : c,
      );
      globalChapters = nextChapters;
      notify();
      return await autoSync(nextChapters);
    },
    [autoSync],
  );

  const allPhotos = chapters.flatMap((c) =>
    c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label })),
  );

  const publicChapters = chapters.filter((c) => !c.hidden);

  const publicPhotos = chapters
    .filter((c) => !c.hidden)
    .flatMap((c) =>
      c.photos
        .filter((p) => !p.hidden)
        .map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label })),
    );

  const setChaptersDirect = useCallback((newData) => {
    globalChapters = newData.map(normalizeChapter);
    notify();
  }, []);

  return {
    chapters,
    publicChapters,
    allPhotos,
    publicPhotos,
    addChapter,
    updateChapter,
    deleteChapter,
    toggleChapterHidden,
    addPhoto,
    updatePhoto,
    deletePhoto,
    togglePhotoHidden,
    setChaptersDirect,
  };
}
