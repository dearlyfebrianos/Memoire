import { useState, useEffect, useCallback } from "react";
import { chapters as defaultChapters } from "./photos";

const STORAGE_KEY = "memoire_data";


function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultChapters;
    const saved = JSON.parse(raw);

    const merged = defaultChapters.map((defChapter) => {
      const savedChapter = saved.find((s) => s.id === defChapter.id);
      if (!savedChapter) return defChapter;

      const mergedPhotos = defChapter.photos.map((defPhoto) => {
        const savedPhoto = savedChapter.photos?.find((p) => p.id === defPhoto.id);
        if (!savedPhoto) return defPhoto;
        return {
          ...savedPhoto,
          hidden: defPhoto.hidden,
        };
      });

      const newPhotos = (savedChapter.photos || []).filter(
        (sp) => !defChapter.photos.find((dp) => dp.id === sp.id)
      );

      return {
        ...savedChapter,
        hidden: defChapter.hidden,
        photos: [...mergedPhotos, ...newPhotos],
      };
    });

    const newChapters = saved.filter(
      (s) => !defaultChapters.find((d) => d.id === s.id)
    );

    return [...merged, ...newChapters];
  } catch {
    return defaultChapters;
  }
}

function saveData(chapters) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
  } catch (e) {
    console.error("Storage error:", e);
  }
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
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  const addChapter = useCallback((chapter) => {
    const newChapter = {
      ...chapter,
      id: chapter.slug || chapter.label.toLowerCase().replace(/\s+/g, "-"),
      hidden: false,
      photos: [],
    };
    globalChapters = [...globalChapters, newChapter];
    saveData(globalChapters);
    notify();
  }, []);

  const updateChapter = useCallback((id, updates) => {
    globalChapters = globalChapters.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    saveData(globalChapters);
    notify();
  }, []);

  const deleteChapter = useCallback((id) => {
    globalChapters = globalChapters.filter((c) => c.id !== id);
    saveData(globalChapters);
    notify();
  }, []);

  const toggleChapterHidden = useCallback((id) => {
    globalChapters = globalChapters.map((c) =>
      c.id === id ? { ...c, hidden: !c.hidden } : c
    );
    saveData(globalChapters);
    notify();
  }, []);

  const addPhoto = useCallback((chapterId, photo) => {
    const newPhoto = { ...photo, id: Date.now() + Math.random(), hidden: false };
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId ? { ...c, photos: [...c.photos, newPhoto] } : c
    );
    saveData(globalChapters);
    notify();
  }, []);

  const updatePhoto = useCallback((chapterId, photoId, updates) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? { ...c, photos: c.photos.map((p) => p.id === photoId ? { ...p, ...updates } : p) }
        : c
    );
    saveData(globalChapters);
    notify();
  }, []);

  const deletePhoto = useCallback((chapterId, photoId) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? { ...c, photos: c.photos.filter((p) => p.id !== photoId) }
        : c
    );
    saveData(globalChapters);
    notify();
  }, []);

  const togglePhotoHidden = useCallback((chapterId, photoId) => {
    globalChapters = globalChapters.map((c) =>
      c.id === chapterId
        ? {
            ...c,
            photos: c.photos.map((p) =>
              p.id === photoId ? { ...p, hidden: !p.hidden } : p
            ),
          }
        : c
    );
    saveData(globalChapters);
    notify();
  }, []);


  const allPhotos = chapters.flatMap((c) =>
    c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))
  );

  const publicChapters = chapters.filter((c) => !c.hidden);

  const publicPhotos = chapters
    .filter((c) => !c.hidden)
    .flatMap((c) =>
      c.photos
        .filter((p) => !p.hidden)
        .map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))
    );

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
  };
}