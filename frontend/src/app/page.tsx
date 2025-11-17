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
        <header className="mb-10 text-center animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Architectural Sketch Generator
          </h1>
          <p className="text-gray-600 mt-2">
            Upload a building photo. We’ll clean obstructions and convert it
            into a pencil-style architectural sketch.
          </p>
        </header>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 animate-scaleIn">
          {/* FILE INPUT */}
          <label className="block mb-6">
            <span className="text-gray-700 font-medium">Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 block w-full text-gray-700 cursor-pointer rounded-lg border border-gray-300 p-2"
            />
          </label>

          {/* PREVIEW */}
          {preview && (
            <div className="mb-6 animate-fadeIn">
              <p className="font-medium text-gray-700 mb-1">Original Image:</p>
              <img
                src={preview}
                alt="preview"
                className="rounded-xl border shadow-sm w-full animate-blurReveal"
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Processing..." : "Generate Sketch"}
          </button>

          {loading && (
            <p className="text-center text-gray-500 mt-3 animate-pulseGlow">
              Cleaning image & generating sketch...
            </p>
          )}
        </div>

        {/* CLEANED IMAGE */}
        {response?.cleanedUrl && (
          <div className="mt-10 animate-fadeIn">
            <p className="font-semibold text-gray-800 mb-2">Cleaned Image:</p>
            <img
              src={response.cleanedUrl}
              alt="cleaned"
              className="rounded-xl border shadow-sm w-full animate-blurReveal"
            />
          </div>
        )}

        {/* SKETCH IMAGE */}
        {response?.sketchUrl && (
          <div className="mt-10 animate-slideUp">
            <p className="font-semibold text-gray-800 mb-2">Final Sketch:</p>
            <img
              src={response.sketchUrl}
              alt="sketch"
              className="rounded-xl border shadow-sm w-full bg-white animate-blurReveal"
            />
          </div>
        )}

        {/* RAW JSON */}
        {response && (
          <details className="mt-10 animate-fadeIn">
            <summary className="cursor-pointer text-gray-700 font-medium">
              Show Response JSON
            </summary>
            <pre className="text-sm bg-gray-100 p-4 rounded-xl mt-3 overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  );
}
