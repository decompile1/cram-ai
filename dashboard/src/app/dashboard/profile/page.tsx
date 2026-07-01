"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

useEffect(() => {
  fetch("/api/profile/avatar/url")
    .then((r) => r.json())
    .then((d) => setAvatarUrl(d.url));
}, []);

  if (!session?.user) {
    return (
      <div className="p-10 text-white">
        Loading...
      </div>
    );
  }

  const user = session.user;

async function uploadImage(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  setUploading(true);

  try {
    const uploadRes = await fetch(
      "/api/profile/avatar/upload-url",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
        }),
      }
    );

    const { url, key } = await uploadRes.json();
    console.log(url);

    await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    await fetch("/api/profile/avatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
      }),
    });

    window.location.reload();
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  } finally {
    setUploading(false);
  }
}

  return (
    <div className="min-h-dvh w-full p-10 text-white bg-slate-950">
      <div className="max-w-2xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">Profile</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">

          {/* Avatar */}
          <div className="flex items-center gap-4">
<div className="w-20 h-20 rounded-full overflow-hidden border border-slate-700 shrink-0">
  <img
    src={avatarUrl ?? "/default-avatar.jpeg"}
    alt={`${user.name ?? "User"}'s profile picture`}
    className="w-full h-full object-cover"
  />
</div>

            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-slate-400 space-y-1">
            <p><span className="text-slate-200">User ID:</span> {user.id}</p>
          </div>

          {/* Upload */}
          <div>

            <label className="block text-sm mb-2 text-slate-300">
  Upload profile picture
</label>

<input
  type="file"
  accept="image/*"
  onChange={uploadImage}
  aria-label="Upload profile picture"
  className="block w-full text-sm text-slate-400"
/>

            {uploading && (
              <p className="text-xs text-indigo-400 mt-2">
                Uploading...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}