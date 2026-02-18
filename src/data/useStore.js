import { useState, useEffect, useCallback } from "react";
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

export function useStore() {
  const [chapters, setChapters] = useState(globalChapters);

  useEffect(() => {
    const handler = (data) => setChapters(data);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  // Poll for updates from GitHub JSON (Live Updates)
  // Poll for updates from GitHub JSON (Live Updates)
  useEffect(() => {
    let isMounted = true;

    const fetchUpdates = async () => {
      try {
        // Use GITHUB_CONFIG for owner, repo, branch, and token
        const owner = GITHUB_CONFIG.owner;
        const repo = GITHUB_CONFIG.repo;
        const branch = GITHUB_CONFIG.branch;
        const token = GITHUB_CONFIG.getToken();

        let fetchedData = null;
        if (token) {
          // Admin Mode: Use API to fetch content securely
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/src/data/photos.json?ref=${branch}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3.raw",
              },
            },
          );
          if (res.ok) fetchedData = await res.json();
        } else {
          // Public Mode: Use Raw URL (Works if repo is public)
          const res = await fetch(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/src/data/photos.json`,
          );
          if (res.ok) fetchedData = await res.json();
        }

        if (isMounted && fetchedData && Array.isArray(fetchedData)) {
          const normalized = fetchedData.map(normalizeChapter);
          // Update only if data changed
          if (JSON.stringify(normalized) !== JSON.stringify(globalChapters)) {
            console.log("Live update detected, refreshing store...");
            globalChapters = normalized;
            notify();
          }
        }
      } catch (e) {
        // Silent fail
      }
    };

    fetchUpdates();
    const interval = setInterval(fetchUpdates, 15000); // Check every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
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
