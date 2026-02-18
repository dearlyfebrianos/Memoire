// Initial credentials — Note: In a real app this would be in a DB,
// but we'll use the same GitHub-sync strategy as photos.js
export const CREDENTIALS = [
  {
    username: "dearly",
    password: "dearlyfebriano08",
    role: "owner",
  },
  {
    username: "admin",
    password: "memoireadmin2026",
    role: "admin",
  },
];

export function generateAuthJS(creds) {
  const credsCode = creds
    .map(
      (c) =>
        `  {\n    username: ${JSON.stringify(c.username)},\n    password: ${JSON.stringify(c.password)},\n    role: ${JSON.stringify(c.role)},\n  }`,
    )
    .join(",\n");

  return `export const CREDENTIALS = [\n${credsCode}\n];\n`;
}
