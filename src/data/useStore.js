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
