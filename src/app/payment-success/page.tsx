import Link from "next/link";
export default function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  return <main className="panel"><p className="category">PAYMENT</p><h1>Payment successful</h1><p>Your payment was confirmed. Campus Mall is updating the related order, promotion or subscription.</p><p className="note">Reference: {(await searchParams).reference || "—"}</p><Link href="/" className="primary-btn">Return to Campus Mall</Link></main>;
}
