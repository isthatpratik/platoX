"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [organization, setOrganization] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    const fetchOrganization = async () => {
      if (!params.slug) return;
      try {
        const res = await fetch(`/api/organization/${params.slug}`);
        const data = await res.json();
        if (data.name) {
          setOrganization(data.name);
        } else {
          router.push("/organization/create");
        }
      } catch (error) {
        console.error("Failed to fetch organization:", error);
        router.push("/organization/create");
      }
    };

    fetchOrganization();
  }, [status, params.slug, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold">
        {organization ? `Welcome to ${organization}` : "Loading..."}
      </h1>
      <p className="mt-2 text-gray-500">Logged in as {session?.user?.email}</p>
      
      {/* 🔹 Logout Button */}
      <Button 
        className="mt-4" 
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
      >
        Logout
      </Button>
    </div>
  );
}
