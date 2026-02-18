export const GITHUB_CONFIG = {
  owner: "dearlyfebrianos",
  repo: "memoire",
  branch: "master",
  filePath: "src/data/photos.js",
  getToken: () => localStorage.getItem("memoire_github_token") || "",
};

// Detect if URL is a video
export function isVideoUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Direct video file extensions
  if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/.test(lower)) return true;
  // YouTube
  if (lower.includes("youtube.com/watch") || lower.includes("youtu.be/"))
    return true;
  // YouTube embed
  if (lower.includes("youtube.com/embed/")) return true;
  // Google Drive video
  if (lower.includes("drive.google.com")) return true;
  return false;
}

export function getMediaType(url) {
  return isVideoUrl(url) ? "video" : "image";
}

// Convert old imageUrls array to new mediaItems format
export function normalizeMediaItems(item) {
  if (item.mediaItems?.length) return item.mediaItems;
  // backward compat: old imageUrls
  if (item.imageUrls?.length) {
    return item.imageUrls.map((url) => ({ type: getMediaType(url), url }));
  }
  if (item.imageUrl) {
    return [{ type: getMediaType(item.imageUrl), url: item.imageUrl }];
  }
  return [];
}

export function generatePhotosJS(chapters) {
  const chaptersCode = chapters
    .map((chapter) => {
      const photosCode = chapter.photos
        .map((photo) => {
          const mediaItems = normalizeMediaItems(photo);

          const mediaItemsCode = mediaItems
            .map(
              (m) =>
                `          { type: "${m.type}", url: ${JSON.stringify(m.url)} }`,
            )
            .join(",\n");

          const tags = photo.tags?.length
            ? `[${photo.tags.map((t) => `"${t}"`).join(", ")}]`
            : "[]";

          const isHidden = photo.hidden === true;

          return `      {
        id: ${typeof photo.id === "number" ? photo.id : `"${photo.id}"`},
        title: ${JSON.stringify(photo.title)},
        caption: ${JSON.stringify(photo.caption || "")},
        mediaItems: [\n${mediaItemsCode}\n        ],
        date: ${JSON.stringify(photo.date || "")},
        tags: ${tags},
        hidden: ${isHidden},
      }`;
        })
        .join(",\n");

      const chapterHidden = chapter.hidden === true;

      return `  {
    id: ${JSON.stringify(chapter.id)},
    label: ${JSON.stringify(chapter.label)},
    slug: ${JSON.stringify(chapter.slug || chapter.id)},
    years: ${JSON.stringify(chapter.years || "")},
    description: ${JSON.stringify(chapter.description || "")},
    coverGradient: ${JSON.stringify(chapter.coverGradient || "from-slate-900/40 to-gray-900/30")},
    accentColor: ${JSON.stringify(chapter.accentColor || "#e8c4a0")},
    emoji: ${JSON.stringify(chapter.emoji || "📸")},
    hidden: ${chapterHidden},
    photos: [\n${photosCode}\n    ],
  }`;
    })
    .join(",\n");

  return `export const chapters = [\n${chaptersCode}\n];\n\nexport const allPhotos = chapters.flatMap((c) =>\n  c.photos.map((p) => ({ ...p, chapter: c.id, chapterLabel: c.label }))\n);\n`;
}

async function getFileSHA(token, config) {
  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
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
  const content = generatePhotosJS(chapters);
  const config = {
    ...GITHUB_CONFIG,
    owner: localStorage.getItem("memoire_github_owner") || GITHUB_CONFIG.owner,
    repo: localStorage.getItem("memoire_github_repo") || GITHUB_CONFIG.repo,
    branch:
      localStorage.getItem("memoire_github_branch") || GITHUB_CONFIG.branch,
  };
  return pushFileToGitHub(content, config.filePath, "Update memories");
}

export function generateAuthJS(creds) {
  const credsCode = creds
    .map(
      (c) =>
        `  {\n    username: ${JSON.stringify(c.username)},\n    password: ${JSON.stringify(c.password)},\n    role: ${JSON.stringify(c.role)},\n  }`,
    )
    .join(",\n");

  return `export const CREDENTIALS = [\n${credsCode}\n];\n`;
}

export async function pushAuthToGitHub(creds) {
  const content = generateAuthJS(creds);
  return pushFileToGitHub(
    content,
    "src/data/authData.js",
    "Update credentials",
  );
}

async function pushFileToGitHub(content, filePath, messagePrefix) {
  const config = {
    ...GITHUB_CONFIG,
    owner: localStorage.getItem("memoire_github_owner") || GITHUB_CONFIG.owner,
    repo: localStorage.getItem("memoire_github_repo") || GITHUB_CONFIG.repo,
    branch:
      localStorage.getItem("memoire_github_branch") || GITHUB_CONFIG.branch,
    filePath,
  };
  const token = config.getToken();
  if (!token) throw new Error("GitHub token belum diset.");

  const contentBase64 = btoa(unescape(encodeURIComponent(content)));
  const sha = await getFileSHA(token, config);

  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `🔐 ${messagePrefix} — ${new Date().toLocaleString("id-ID")}`,
        content: contentBase64,
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Token atau repo tidak valid");
  }
  const data = await res.json();
  return {
    repoName: data.full_name,
    private: data.private,
    defaultBranch: data.default_branch,
  };
}
