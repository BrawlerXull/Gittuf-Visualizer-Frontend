import type { Commit } from "./types"

// Mock data for commits
const mockCommits: Commit[] = [
  {
    hash: "34360d799489d607ac5d29c8953c5fec9f0ac18f",
    message: "Add rule 'protect-releases' to policy 'targets'",
    author: "Aditya Sirish",
    date: "2025-04-23T12:39:29-04:00",
  },
  {
    hash: "5485d2478dbd42a081e7203a75cc21b272515837",
    message: "Add rule 'protect-main' to policy 'targets'",
    author: "Aditya Sirish",
    date: "2025-04-23T12:39:18-04:00",
  },
  {
    hash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    message: "Update schema version to v0.2",
    author: "Billy Chen",
    date: "2025-04-22T10:15:42-04:00",
  },
  {
    hash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    message: "Add GitHub App integration for CI/CD",
    author: "Aditya Sirish",
    date: "2025-04-21T15:30:11-04:00",
  },
  {
    hash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    message: "Initial policy setup with root and targets roles",
    author: "Billy Chen",
    date: "2025-04-20T09:45:33-04:00",
  },
]

// Mock data for metadata
const mockRootJsonVersions = {
  c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4: {
    type: "root",
    schemaVersion: "https://gittuf.dev/policy/root/v0.1",
    expires: "2026-04-20T09:45:33-04:00",
    principals: {
      "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY": {
        keyid_hash_algorithms: null,
        keytype: "ssh",
        keyval: { public: "AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." },
        scheme: "ssh-rsa",
        keyid: "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY",
      },
      "aditya@saky.in::https://github.com/login/oauth": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "aditya@saky.in", issuer: "https://github.com/login/oauth" },
        scheme: "fulcio",
        keyid: "aditya@saky.in::https://github.com/login/oauth",
      },
    },
    roles: {
      root: {
        principalIDs: ["aditya@saky.in::https://github.com/login/oauth"],
        threshold: 1,
      },
      targets: {
        principalIDs: ["aditya@saky.in::https://github.com/login/oauth"],
        threshold: 1,
      },
    },
    githubApps: {},
  },
  b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3: {
    type: "root",
    schemaVersion: "https://gittuf.dev/policy/root/v0.1",
    expires: "2026-04-21T15:30:11-04:00",
    principals: {
      "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY": {
        keyid_hash_algorithms: null,
        keytype: "ssh",
        keyval: { public: "AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." },
        scheme: "ssh-rsa",
        keyid: "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY",
      },
      "aditya@saky.in::https://github.com/login/oauth": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "aditya@saky.in", issuer: "https://github.com/login/oauth" },
        scheme: "fulcio",
        keyid: "aditya@saky.in::https://github.com/login/oauth",
      },
    },
    roles: {
      root: {
        principalIDs: ["aditya@saky.in::https://github.com/login/oauth"],
        threshold: 1,
      },
      targets: {
        principalIDs: ["aditya@saky.in::https://github.com/login/oauth"],
        threshold: 1,
      },
    },
    githubApps: {
      "https://gittuf.dev/github-app": {
        trusted: true,
        principalIDs: ["SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY"],
        threshold: 1,
      },
    },
  },
  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2: {
    type: "root",
    schemaVersion: "https://gittuf.dev/policy/root/v0.2",
    expires: "2026-04-22T10:15:42-04:00",
    principals: {
      "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY": {
        keyid_hash_algorithms: null,
        keytype: "ssh",
        keyval: { public: "AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." },
        scheme: "ssh-rsa",
        keyid: "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY",
      },
      "aditya@saky.in::https://github.com/login/oauth": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "aditya@saky.in", issuer: "https://github.com/login/oauth" },
        scheme: "fulcio",
        keyid: "aditya@saky.in::https://github.com/login/oauth",
      },
      "billy@chainguard.dev::https://accounts.google.com": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "billy@chainguard.dev", issuer: "https://accounts.google.com" },
        scheme: "fulcio",
        keyid: "billy@chainguard.dev::https://accounts.google.com",
      },
    },
    roles: {
      root: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
      targets: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
    },
    githubApps: {
      "https://gittuf.dev/github-app": {
        trusted: true,
        principalIDs: ["SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY"],
        threshold: 1,
      },
    },
  },
  "5485d2478dbd42a081e7203a75cc21b272515837": {
    type: "root",
    schemaVersion: "https://gittuf.dev/policy/root/v0.2",
    expires: "2026-04-23T12:33:38-04:00",
    principals: {
      "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY": {
        keyid_hash_algorithms: null,
        keytype: "ssh",
        keyval: { public: "AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." },
        scheme: "ssh-rsa",
        keyid: "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY",
      },
      "aditya@saky.in::https://github.com/login/oauth": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "aditya@saky.in", issuer: "https://github.com/login/oauth" },
        scheme: "fulcio",
        keyid: "aditya@saky.in::https://github.com/login/oauth",
      },
      "billy@chainguard.dev::https://accounts.google.com": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "billy@chainguard.dev", issuer: "https://accounts.google.com" },
        scheme: "fulcio",
        keyid: "billy@chainguard.dev::https://accounts.google.com",
      },
    },
    roles: {
      root: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
      targets: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
    },
    githubApps: {
      "https://gittuf.dev/github-app": {
        trusted: true,
        principalIDs: ["SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY"],
        threshold: 1,
      },
    },
  },
  "34360d799489d607ac5d29c8953c5fec9f0ac18f": {
    type: "root",
    schemaVersion: "https://gittuf.dev/policy/root/v0.2",
    expires: "2026-04-23T12:33:38-04:00",
    principals: {
      "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY": {
        keyid_hash_algorithms: null,
        keytype: "ssh",
        keyval: { public: "AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." },
        scheme: "ssh-rsa",
        keyid: "SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY",
      },
      "aditya@saky.in::https://github.com/login/oauth": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "aditya@saky.in", issuer: "https://github.com/login/oauth" },
        scheme: "fulcio",
        keyid: "aditya@saky.in::https://github.com/login/oauth",
      },
      "billy@chainguard.dev::https://accounts.google.com": {
        keyid_hash_algorithms: null,
        keytype: "sigstore-oidc",
        keyval: { identity: "billy@chainguard.dev", issuer: "https://accounts.google.com" },
        scheme: "fulcio",
        keyid: "billy@chainguard.dev::https://accounts.google.com",
      },
    },
    roles: {
      root: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
      targets: {
        principalIDs: [
          "aditya@saky.in::https://github.com/login/oauth",
          "billy@chainguard.dev::https://accounts.google.com",
        ],
        threshold: 1,
      },
    },
    githubApps: {
      "https://gittuf.dev/github-app": {
        trusted: true,
        principalIDs: ["SHA256:KTrCAHHGUSCkNjanR0t4ojOiHQ4qZIQM6mkwX64b2KY"],
        threshold: 1,
      },
    },
  },
}

const mockTargetsJsonVersions = {
  c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4: {
    type: "targets",
    schemaVersion: "https://gittuf.dev/policy/targets/v0.1",
    expires: "2026-04-20T09:45:33-04:00",
    rules: {},
  },
  b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3: {
    type: "targets",
    schemaVersion: "https://gittuf.dev/policy/targets/v0.1",
    expires: "2026-04-21T15:30:11-04:00",
    rules: {},
  },
  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2: {
    type: "targets",
    schemaVersion: "https://gittuf.dev/policy/targets/v0.1",
    expires: "2026-04-22T10:15:42-04:00",
    rules: {},
  },
  "5485d2478dbd42a081e7203a75cc21b272515837": {
    type: "targets",
    schemaVersion: "https://gittuf.dev/policy/targets/v0.1",
    expires: "2026-04-23T12:33:38-04:00",
    rules: {
      "protect-main": {
        pattern: "refs/heads/main",
        action: "push",
        requirements: {
          authorizedPrincipals: [
            "aditya@saky.in::https://github.com/login/oauth",
            "billy@chainguard.dev::https://accounts.google.com",
          ],
          threshold: 1,
        },
      },
    },
  },
  "34360d799489d607ac5d29c8953c5fec9f0ac18f": {
    type: "targets",
    schemaVersion: "https://gittuf.dev/policy/targets/v0.1",
    expires: "2026-04-23T12:33:38-04:00",
    rules: {
      "protect-main": {
        pattern: "refs/heads/main",
        action: "push",
        requirements: {
          authorizedPrincipals: [
            "aditya@saky.in::https://github.com/login/oauth",
            "billy@chainguard.dev::https://accounts.google.com",
          ],
          threshold: 1,
        },
      },
      "protect-releases": {
        pattern: "refs/tags/v*",
        action: "push",
        requirements: {
          authorizedPrincipals: [
            "aditya@saky.in::https://github.com/login/oauth",
            "billy@chainguard.dev::https://accounts.google.com",
          ],
          threshold: 2,
        },
      },
    },
  },
}

// Mock API functions
export async function mockFetchCommits(url: string): Promise<Commit[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Validate URL (simple check)
  if (!url.includes("github.com")) {
    throw new Error("Invalid GitHub URL")
  }

  return mockCommits
}

export async function fetchCommits(url: string) {
  const response = await fetch("http://localhost:5000/commits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) throw new Error("Failed to fetch commits")
  return await response.json()
}


export async function fetchMetadata(url: string, commit: string, file: string) {
  const response = await fetch("http://localhost:5000/metadata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, commit, file }),
  })

  if (!response.ok) throw new Error("Failed to fetch metadata")
  return await response.json()
}


export async function mockFetchMetadata(url: string, commit: string, file: string): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Validate inputs
  if (!url.includes("github.com")) {
    throw new Error("Invalid GitHub URL")
  }

  if (!commit || commit.length < 8) {
    throw new Error("Invalid commit hash")
  }

  // Return appropriate mock data based on file and commit
  if (file === "root.json") {
    return mockRootJsonVersions[commit] || mockRootJsonVersions["34360d799489d607ac5d29c8953c5fec9f0ac18f"]
  } else if (file === "targets.json") {
    return mockTargetsJsonVersions[commit] || mockTargetsJsonVersions["34360d799489d607ac5d29c8953c5fec9f0ac18f"]
  } else {
    throw new Error(`File '${file}' not found in commit`)
  }
}
