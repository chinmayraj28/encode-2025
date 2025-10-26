'use client';

import { useState } from 'react';

export default function MediaUploader() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    alert(`Uploading ${file.name} (mock functionality)`);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}
