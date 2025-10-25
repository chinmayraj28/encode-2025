// src/utils/storyClient.js
let storyClient = null;
let isMock = false;

try {
  // The GitHub package you installed registers under a name like `typescript-sdk`.
  // Adjust the import if your package exposes a different name — check node_modules.
  const { StoryClient } = require("typescript-sdk"); // CommonJS require is more tolerant here
  // Create client instance — update baseUrl/apiKey per Story docs if needed
  storyClient = new StoryClient({
    baseUrl: process.env.REACT_APP_STORY_BASE_URL || "https://api.storyprotocol.net/api/v1",
    apiKey: process.env.REACT_APP_STORY_API_KEY || undefined,
  });
} catch (err) {
  // Fallback mock client so UI + flow can be developed without a working SDK/key
  isMock = true;
  console.warn("Story SDK not available; using mock client.", err);
  storyClient = {
    // Example mock method: get asset by hash
    ipAssets: {
      async getByHash(hash) {
        // Simulate "not found" vs "found"
        if (!hash) throw new Error("no hash provided");
        if (hash.endsWith("0")) {
          // pretend it's registered
          return {
            found: true,
            owner: "0x1234567890abcdef",
            registeredAt: new Date().toISOString(),
            metadata: { title: "Mocked IP asset", type: "image" },
          };
        }
        // not registered
        return { found: false };
      },
    },
  };
}

module.exports = { storyClient, isMock };
