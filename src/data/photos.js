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
    hidden: true,
    photos: [
      {
        id: 1771325247206.3179,
        title: "Memories On Februari 9th, 2026",
        caption: "Momen kebersamaan kami usai berolahraga, sebelum menuju Kenjeran untuk menikmati waktu istirahat sejenak.",
        mediaItems: [
          { type: "image", url: "https://i.ibb.co.com/HT8G9WMc/Whats-App-Image-2026-02-17-at-17-42-16.jpg" },
          { type: "image", url: "https://i.ibb.co.com/tPh5W8DP/4.jpg" },
          { type: "image", url: "https://res.cloudinary.com/dg3awuzug/image/upload/v1771352677/y6wdvavfemcikqk9jste.jpg" },
          { type: "image", url: "https://res.cloudinary.com/dg3awuzug/image/upload/v1771352688/y2u75ig5pam3dlmmmzfj.jpg" },
          { type: "image", url: "https://res.cloudinary.com/dg3awuzug/image/upload/v1771352694/dwzvv6tg0vyo37oclm1m.jpg" },
          { type: "image", url: "https://res.cloudinary.com/dg3awuzug/image/upload/v1771352705/ldldbtjw2bmm7zxtsdpd.jpg" },
          { type: "image", url: "https://res.cloudinary.com/dg3awuzug/image/upload/v1771352714/ahy0oh7ek1qxy75axcxh.jpg" },
          { type: "video", url: "https://res.cloudinary.com/dg3awuzug/video/upload/v1771382984/wegsjq1u6ekucj4vinqn.mp4" }
        ],
        date: "9, Februari 2026",
        tags: ["girl friend", "boy friend", "foto bersama"],
        hidden: true,
      }
    ],
  },
  {
    id: "test",
    label: "Test",
    slug: "test",
    years: "",
    description: "",
    coverGradient: "from-slate-900/40 to-gray-900/30",
    accentColor: "#f87171",
    emoji: "😈",
    hidden: false,
    photos: [

    ],
  }
];

export const allPhotos = chapters.flatMap((c) =>
  c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))
);
