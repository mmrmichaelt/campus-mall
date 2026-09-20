import Link from "next/link";

export default function ProPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Campus Mall Pro</h1>
        <p className="mt-2 text-gray-600">
          Upgrade your Campus Mall account to Pro.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Monthly</h2>
            <p className="mt-2 text-2xl font-bold">KES 199</p>
            <p className="mt-2 text-sm text-gray-600">
              Pro access billed monthly.
            </p>
            <Link
              href="/account/pro"
              className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Continue
            </Link>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Yearly</h2>
            <p className="mt-2 text-2xl font-bold">KES 1,999</p>
            <p className="mt-2 text-sm text-gray-600">
              Pro access billed yearly.
            </p>
            <Link
              href="/account/pro"
              className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Continue
            </Link>
          </div>
        </div>

        <Link
          href="/account/pro"
          className="mt-8 inline-block text-sm font-semibold text-red-600"
        >
          Back to Pro account
        </Link>
      </div>
    </main>
  );
}
