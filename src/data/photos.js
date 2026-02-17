export const chapters = [
  {
    id: "sekolah-menengah-atas",
    label: "SMA",
    slug: "high-school",
    years: "2018 – 2022",
    description: "Four years of laughter, late nights studying, and friendships that shaped who I am.",
    coverGradient: "from-rose-900/40 to-purple-900/30",
    accentColor: "#c084fc",
    emoji: "🎓",
    photos: [
      {
        id: 1,
        title: "Prom Night",
        caption: "A night dressed in stars and laughter.",
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        date: "May 2022",
        tags: ["night", "friends"],
      },
    ]
  },
];

export const allPhotos = chapters.flatMap((c) => c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label })));