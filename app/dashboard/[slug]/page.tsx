"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organization, setOrganization] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    const fetchOrganization = async () => {
      const res = await fetch(`/api/organization/${params.slug}`);
      const data = await res.json();
      if (data.name) {
        setOrganization(data.name);
      } else {
        router.push("/organization/create"); // Redirect if invalid slug
      }
    };

    if (params.slug) {
      fetchOrganization();
    }
  }, [status, params.slug, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{organization ? `Welcome to ${organization}` : "Loading..."}</h1>
    </div>
  );
}
