import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="panel">
      <h1>About Campus Mall</h1>
      <p>Campus Mall is a marketplace for students and outsiders to buy, sell, discover services and communicate around their campus communities.</p>
      <Link className="secondary-btn" href="/settings">Back to Settings</Link>
    </div>
  );
}
