'use client';

import { useState } from 'react';

export default function MediaUploader() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="media-uploader">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        className="bg-[color:var(--surface)] text-[color:var(--text)] p-2 rounded-md"
      />
      {file && <p>Selected file: {file.name}</p>}
      <button className="btn-primary mt-2">Upload</button>
    </div>
  );
}
