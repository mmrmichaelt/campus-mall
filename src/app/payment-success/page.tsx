import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="panel">
      <p className="category">PAYMENT</p>
      <h1>Payment successful</h1>
      <p>
        Your payment was confirmed. Campus Mall is updating the related order,
        promotion or subscription.
      </p>
      <p className="note">Reference: {params.reference || "—"}</p>
      <Link href="/" className="primary-btn">
        Return to Campus Mall
      </Link>
    </main>
  );
}
