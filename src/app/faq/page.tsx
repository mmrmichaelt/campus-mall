import Link from "next/link";

export default function FaqPage() {
  return (
    <div className="panel">
      <h1>Frequently Asked Questions</h1>
      <h2>How do I post an item?</h2>
      <p>Open Add item, choose the category, add the item details and publish it to the marketplace.</p>
      <h2>How do I contact a seller?</h2>
      <p>Open the marketplace item and use Chat seller after completing the required verification.</p>
      <Link className="secondary-btn" href="/settings">Back to Settings</Link>
    </div>
  );
}
