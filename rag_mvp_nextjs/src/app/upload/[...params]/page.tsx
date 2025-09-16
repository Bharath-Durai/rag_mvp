"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function Upload({
  params,
}: {
  params: Promise<{ params?: string[] }>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const resolvedParams = use(params);
  const routeParams = resolvedParams.params || [];

  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    if (!file) {
      setStatus("No file selected");
      setLoading(false);

      return;
    }

    if (routeParams.length == 0) {
      setStatus("Organization ID is missing");
      setLoading(false);

      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("orgID", routeParams[0]);

    try {
      const res = await fetch(`${baseUrl}/files/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setStatus("Uploaded Successfull: " + result.fileName);
        setLoading(true);

        router.push(`/chat/${routeParams[0]}`);
      } else {
        setStatus("Upload failed");
        setLoading(false);
      }
    } catch (error) {
      setStatus("Error uploading file");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen min-w-screen bg-gradient-to-b from-sky-100 to-indigo-100">
      <div className="flex flex-col items-center justify-center w-1/3 h-[50vh] border border-black-100 gap-10 py-4 shadow-2xl rounded-lg bg-white">
        <h2 className="text-2xl font-semibold text-gray-800">Upload Page</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-500 rounded px-3 py-2 w-full max-w-sm"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all disabled:bg-blue-300"
          disabled={loading}
        >
          upload
        </button>
        <p className="text-sm text-gray-600 mt-2">{status}</p>
      </div>
    </div>
  );
}
