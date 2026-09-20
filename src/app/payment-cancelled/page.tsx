import Link from "next/link";
export default function PaymentCancelledPage() {
  return <main className="panel"><p className="category">PAYMENT</p><h1>Payment not completed</h1><p>No successful payment was confirmed. You can return to Campus Mall and choose another payment method.</p><Link href="/" className="primary-btn">Return to Campus Mall</Link></main>;
}
