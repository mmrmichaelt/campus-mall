"use client";

import { useRouter } from "next/navigation";

export default function ProPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Campus Mall Pro</h1>
        <p className="mt-2 text-gray-600">Premium tools for sellers and active marketplace users, including expanded campus membership.</p>\n        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-gray-800">\n          <h2 className="text-xl font-semibold">Multi-institution membership</h2>\n          <p className="mt-2">A standard account can be associated with up to <strong>2 institutions</strong>. Campus Mall Pro can unlock membership in more institutions, so you can post, browse and participate across campuses where you study, work or visit.</p>\n          <p className="mt-2 text-sm text-gray-600">The exact institution limit can be configured by Campus Mall as the membership feature expands.</p>\n        </div>
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
