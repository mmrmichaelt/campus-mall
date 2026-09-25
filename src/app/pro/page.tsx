"use client";

import { useRouter } from "next/navigation";
import { PRO_FEATURES } from "@/lib/pro";

export default function ProPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Campus Mall Pro</h1>
        <p className="mt-2 text-gray-600">More selling power, promotion tools and marketplace features.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {PRO_FEATURES.map((feature) => (
            <section key={feature.title} className="rounded-xl border p-4">
              <h2 className="font-semibold">{feature.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold">Free vs Pro</h2>
          <p className="mt-2">Free: up to 5 active listings.</p>
          <p>Pro: up to 50 active listings, plus the Pro features above.</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">Monthly</h2>
            <p className="mt-2 text-3xl font-bold">KSh 199</p>
            <button onClick={() => router.push("/pro/checkout?plan=MONTHLY")} className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">Choose monthly</button>
          </section>
          <section className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">Yearly</h2>
            <p className="mt-2 text-3xl font-bold">KSh 1,999</p>
            <button onClick={() => router.push("/pro/checkout?plan=YEARLY")} className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white">Choose yearly</button>
          </section>
        </div>
      </div>
    </main>
  );
}
