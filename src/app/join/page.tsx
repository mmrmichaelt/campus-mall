"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountForms from "../../components/AccountForms";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        if (data?.user) {
          setLoggedIn(true);
          router.replace("/");
        } else {
          setLoggedIn(false);
        }
      })
      .catch(() => {
        if (active) setLoggedIn(false);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (checking || loggedIn) return null;

  return (
    <>
      <AccountForms />
      <div style={{ textAlign: "center", marginTop: "-8px", paddingBottom: "24px" }}>
        <Link href="/guest" className="primary-btn">Continue as Guest</Link>
      </div>
    </>
  );
}
