import { useState, useEffect, useCallback } from "react";
import { chapters as defaultChapters } from "./photos";
import { normalizeMediaItems } from "./githubSync";

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
        const owner =
          localStorage.getItem("memoire_github_owner") || "dearlyfebrianos";
        const repo = localStorage.getItem("memoire_github_repo") || "memoire";
        const branch =
          localStorage.getItem("memoire_github_branch") || "master";
        const token = localStorage.getItem("memoire_github_token");

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

  const addChapter = useCallback((chapter) => {
    const newChapter = {
      ...chapter,
      id: chapter.slug || chapter.label.toLowerCase().replace(/\s+/g, "-"),
      hidden: false,
      photos: [],
    };
    globalChapters = [...globalChapters, newChapter];
    notify();
  }, []);

  const updateChapter = useCallback((id, updates) => {
    globalChapters = globalChapters.map((c) =>
      c.id === id ? { ...c, ...updates } : c,
    );
    notify();
  }, []);

  const deleteChapter = useCallback((id) => {
    globalChapters = globalChapters.filter((c) => c.id !== id);
    notify();
  }, []);

  const toggleChapterHidden = useCallback((id) => {
    globalChapters = globalChapters.map((c) =>
      c.id === id ? { ...c, hidden: !c.hidden } : c,
    );
    notify();
  }, []);

  const addPhoto = useCallback((chapterId, photo) => {
    const newPhoto = normalizePhoto({
      ...photo,
      id: Date.now() + Math.random(),
      hidden: false,
    });
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId ? { ...c, photos: [...c.photos, newPhoto] } : c,
    );
    notify();
  }, []);

  const updatePhoto = useCallback((chapterId, photoId, updates) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? {
            ...c,
            photos: c.photos.map((p) =>
              p.id === photoId ? normalizePhoto({ ...p, ...updates }) : p,
            ),
          }
        : c,
    );
    notify();
  }, []);

  const deletePhoto = useCallback((chapterId, photoId) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? { ...c, photos: c.photos.filter((p) => p.id !== photoId) }
        : c,
    );
    notify();
  }, []);

  const togglePhotoHidden = useCallback((chapterId, photoId) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? {
            ...c,
            photos: c.photos.map((p) =>
              p.id === photoId ? { ...p, hidden: !p.hidden } : p,
            ),
          }
        : c,
    );
    notify();
  }, []);

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
