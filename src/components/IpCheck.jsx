// src/components/IpCheck.jsx
import React, { useState } from "react";
import { storyClient, isMock } from "../utils/storyClient";
import { fileToSHA256Hex } from "../utils/hashFile";

export default function IpCheck() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onFileChange = (e) => {
    setResult(null);
    setError("");
    setHash("");
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const onCheck = async () => {
    if (!file) return setError("Please choose a file first.");
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const fileHash = await fileToSHA256Hex(file);
      setHash(fileHash);

      // Call Story SDK wrapper
      // This expects storyClient.ipAssets.getByHash(hash) — adjust if your SDK uses a different function name.
      const res = await storyClient.ipAssets.getByHash(fileHash);

      // Example response handling — adjust to match real SDK return shape
      if (res?.found || (res && res.owner)) {
        setResult({
          registered: true,
          owner: res.owner || res.address || "unknown",
          metadata: res.metadata || {},
          raw: res,
        });
      } else {
        setResult({ registered: false });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to check IP on-chain. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "1rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h2>IP Enforcement — Check a File on Story</h2>

      <label style={{ display: "block", marginBottom: 8 }}>
        <input type="file" onChange={onFileChange} />
      </label>

      <div style={{ margin: "8px 0" }}>
        <button onClick={onCheck} disabled={!file || loading} style={{ padding: "8px 12px" }}>
          {loading ? "Checking…" : "Check IP on-chain"}
        </button>
      </div>

      {isMock && (
        <div style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>
          Using mock Story client — replace with real API key & SDK for production.
        </div>
      )}

      {error && <div style={{ color: "red" }}>{error}</div>}

      {hash && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#333" }}>
          File hash (SHA-256): <code style={{ wordBreak: "break-all" }}>{hash}</code>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
          {result.registered ? (
            <div>
              <strong>Registered on Story</strong>
              <div>Owner: {result.owner}</div>
              <div>Metadata: <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.metadata, null, 2)}</pre></div>
              <details>
                <summary>Raw response</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.raw, null, 2)}</pre>
              </details>
            </div>
          ) : (
            <div>
              <strong>Not registered</strong>
              <div>This file hash was not found on-chain (per the Story query).</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
