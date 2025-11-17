"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sketch/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center items-start py-16 px-6">
      <div className="w-full max-w-xl">
        {/* HEADER */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Architectural Sketch Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Upload a building photo. We’ll clean it and turn it into a
            pencil-style architectural sketch.
          </p>
        </header>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          {/* FILE INPUT */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer mb-6 block text-gray-700"
          />

          {/* PREVIEW */}
          {preview && (
            <div className="mb-6">
              <img
                src={preview}
                alt="preview"
                className="rounded-xl border shadow-sm w-full"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>

        {/* RESPONSE */}
        {response?.cleanedUrl && (
          <div className="mt-6">
            <p className="font-medium text-gray-800 mb-2">Cleaned Image:</p>
            <img
              src={response.cleanedUrl}
              alt="cleaned"
              className="rounded-xl border shadow-sm"
            />
          </div>
        )}
      </div>
    </main>
  );
}
