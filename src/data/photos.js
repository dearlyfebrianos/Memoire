export const chapters = [
  {
    id: "aku--eshal",
    label: "Aku & Eshal",
    slug: "aku--eshal",
    years: "2026",
    description: "sebuah Bab yang berisi foto kenangan aku dan eshal",
    coverGradient: "from-slate-900/40 to-gray-900/30",
    accentColor: "#f472b6",
    emoji: "🌸",
    hidden: false,
    photos: [
      {
        id: 1771325247206.3179,
        title: "Memories On Februari 9th, 2026",
        caption: "Foto kenangan kami ketika sesudah berolahraga dan kami menuju ke kenjeran untuk rehat sejenak",
        mediaItems: [
          { type: "image", url: "https://i.ibb.co.com/HT8G9WMc/Whats-App-Image-2026-02-17-at-17-42-16.jpg" },
          { type: "image", url: "https://i.ibb.co.com/tPh5W8DP/4.jpg" },
        ],
        date: "Februari 2026",
        tags: ["girl friend", "boy friend"],
        hidden: false,
      }
    ],
  }
];

export const allPhotos = chapters.flatMap((c) =>
  c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))
);