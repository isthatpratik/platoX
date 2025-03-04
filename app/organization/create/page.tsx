"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateOrganization() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user?.id) return setError("Not authenticated");

    const response = await fetch("/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, userId: session.user.id }),
    });

    const data = await response.json();
    if (response.ok) {
      router.push(`/dashboard/${data.slug}`);
    } else {
      setError(data.error || "Could not create organization");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Create Organization</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization Name"
          className="input"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="btn-primary">Create</button>
      </form>
    </div>
  );
}
