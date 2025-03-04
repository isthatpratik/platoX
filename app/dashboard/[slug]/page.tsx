"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams(); // ✅ Use `useParams()` instead of `params` prop
  const [organization, setOrganization] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    const fetchOrganization = async () => {
      if (!params.slug) return; // Prevent fetching if slug is missing
      const res = await fetch(`/api/organization/${params.slug}`);
      const data = await res.json();
      if (data.name) {
        setOrganization(data.name);
      } else {
        router.push("/organization/create"); // Redirect if invalid slug
      }
    };

    fetchOrganization();
  }, [status, params.slug, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{organization ? `Welcome to ${organization}` : "Loading..."}</h1>
    </div>
  );
}
