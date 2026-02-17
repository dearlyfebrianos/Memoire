export const GITHUB_CONFIG = {
  owner: "dearlyfebrianos",
  repo: "memoire",
  branch: "main",
  filePath: "src/data/photos.js",
  getToken: () => localStorage.getItem("memoire_github_token") || "",
};

export function generatePhotosJS(chapters) {
  const chaptersCode = chapters.map((chapter) => {
    const photosCode = chapter.photos.map((photo) => {
      const urls = photo.imageUrls?.length
        ? photo.imageUrls
        : photo.imageUrl
        ? [photo.imageUrl]
        : [];

      const urlsCode = urls.length === 1
        ? `["${urls[0]}"]`
        : `[\n${urls.map((u) => `          "${u}"`).join(",\n")},\n        ]`;

      const tags = photo.tags?.length
        ? `[${photo.tags.map((t) => `"${t}"`).join(", ")}]`
        : "[]";

      return `      {
        id: ${typeof photo.id === "number" ? photo.id : `"${photo.id}"`},
        title: ${JSON.stringify(photo.title)},
        caption: ${JSON.stringify(photo.caption || "")},
        imageUrls: ${urlsCode},
        date: ${JSON.stringify(photo.date || "")},
        tags: ${tags},
      }`;
    }).join(",\n");

    return `  {
    id: ${JSON.stringify(chapter.id)},
    label: ${JSON.stringify(chapter.label)},
    slug: ${JSON.stringify(chapter.slug || chapter.id)},
    years: ${JSON.stringify(chapter.years || "")},
    description: ${JSON.stringify(chapter.description || "")},
    coverGradient: ${JSON.stringify(chapter.coverGradient || "from-slate-900/40 to-gray-900/30")},
    accentColor: ${JSON.stringify(chapter.accentColor || "#e8c4a0")},
    emoji: ${JSON.stringify(chapter.emoji || "📸")},
    photos: [\n${photosCode}\n    ],
  }`;
  }).join(",\n");

  return `export const chapters = [\n${chaptersCode}\n];\n\nexport const allPhotos = chapters.flatMap((c) =>\n  c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))\n);\n`;
}

async function getFileSHA(token, config) {
  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json();
    throw new Error(`GitHub error: ${err.message}`);
  }
  const data = await res.json();
  return data.sha;
}

export async function pushToGitHub(chapters) {
  const config = {
    ...GITHUB_CONFIG,
    owner: localStorage.getItem("memoire_github_owner") || GITHUB_CONFIG.owner,
    repo: localStorage.getItem("memoire_github_repo") || GITHUB_CONFIG.repo,
    branch: localStorage.getItem("memoire_github_branch") || GITHUB_CONFIG.branch,
  };
  const token = config.getToken();
  if (!token) throw new Error("GitHub token belum diset. Klik tombol GitHub untuk setup.");

  const content = generatePhotosJS(chapters);
  const contentBase64 = btoa(unescape(encodeURIComponent(content)));
  const sha = await getFileSHA(token, config);

  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `📸 Update photos.js — ${new Date().toLocaleString("id-ID")}`,
        content: contentBase64,
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Push gagal: ${err.message}`);
  }
  const result = await res.json();
  return {
    success: true,
    commitUrl: result.commit?.html_url,
    commitSha: result.commit?.sha?.slice(0, 7),
  };
}

export async function verifyToken(token, owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Token atau repo tidak valid");
  }
  const data = await res.json();
  return { repoName: data.full_name, private: data.private, defaultBranch: data.default_branch };
}