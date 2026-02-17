export const chapters = [
  {
    id: "high-school",
    label: "High School",
    slug: "high-school",
    years: "2018 – 2022",
    description: "Four years of laughter, late nights studying, and friendships that shaped who I am.",
    coverGradient: "from-rose-900/40 to-purple-900/30",
    accentColor: "#c084fc",
    emoji: "🎓",
    photos: [
      {
        id: 1,
        title: "Graduation Day",
        caption: "The moment we'd worked four years toward.",
        imageUrls: [
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
        ],
        date: "June 2022",
        tags: ["milestone", "ceremony"],
      },
      {
        id: 2,
        title: "Prom Night",
        caption: "A night dressed in stars and laughter.",
        imageUrls: ["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80"],
        date: "May 2022",
        tags: ["night", "friends"],
      },
      {
        id: 3,
        title: "The Science Fair",
        caption: "Sleep-deprived but proud of every poster board.",
        imageUrls: [
          "https://images.unsplash.com/photo-1532094349884-543559563a46?w=800&q=80",
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
        ],
        date: "March 2021",
        tags: ["school", "achievement"],
      },
      {
        id: 4,
        title: "Lunch Crew",
        caption: "Same table, every single day for four years.",
        imageUrls: ["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"],
        date: "2020",
        tags: ["friends", "everyday"],
      },
      {
        id: 5,
        title: "Homecoming Game",
        caption: "Screaming our hearts out under the Friday lights.",
        imageUrls: [
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
        ],
        date: "October 2021",
        tags: ["sports", "spirit"],
      },
      {
        id: 6,
        title: "Drama Club Performance",
        caption: "Stage fright was real. The applause was realer.",
        imageUrls: ["https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80"],
        date: "December 2020",
        tags: ["arts", "performance"],
      }
    ],
  },
  {
    id: "middle-school",
    label: "Middle School",
    slug: "middle-school",
    years: "2015 – 2018",
    description: "Awkward, wonderful, chaotic years of figuring out who I wanted to be.",
    coverGradient: "from-sky-900/40 to-teal-900/30",
    accentColor: "#38bdf8",
    emoji: "📚",
    photos: [
      {
        id: 7,
        title: "First Day of 6th Grade",
        caption: "New backpack, new nerves, new chapter.",
        imageUrls: ["https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"],
        date: "September 2015",
        tags: ["milestone", "firstday"],
      },
      {
        id: 8,
        title: "Summer Reading Challenge",
        caption: "Fifty books. I still count this as an achievement.",
        imageUrls: [
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
        ],
        date: "Summer 2016",
        tags: ["books", "summer"],
      },
      {
        id: 9,
        title: "School Trip to the Museum",
        caption: "Pretending to care about history while secretly loving it.",
        imageUrls: ["https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80"],
        date: "April 2017",
        tags: ["field trip", "culture"],
      },
      {
        id: 10,
        title: "Art Class Masterpiece",
        caption: "My teacher said it had 'unique perspective.' I'll take it.",
        imageUrls: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"],
        date: "2017",
        tags: ["art", "creative"],
      },
      {
        id: 11,
        title: "Track and Field Day",
        caption: "I finished last. I still showed up.",
        imageUrls: ["https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80"],
        date: "May 2016",
        tags: ["sports", "fun"],
      },
      {
        id: 12,
        title: "Eighth Grade Farewell",
        caption: "Tearful goodbyes to the hallways that raised us.",
        imageUrls: [
          "https://images.unsplash.com/photo-1523368749929-6b2bf370d880?w=800&q=80",
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
        ],
        date: "June 2018",
        tags: ["milestone", "farewell"],
      }
    ],
  },
  {
    id: "aku--eshal",
    label: "Aku & Eshal",
    slug: "aku--eshal",
    years: "2026",
    description: "sebuah Bab yang berisi foto kenangan aku dan eshal",
    coverGradient: "from-slate-900/40 to-gray-900/30",
    accentColor: "#f472b6",
    emoji: "🌸",
    photos: [

    ],
  }
];

export const allPhotos = chapters.flatMap((c) =>
  c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))
);
