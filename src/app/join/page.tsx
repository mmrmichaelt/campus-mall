import Link from "next/link";
import AccountForms from "../../components/AccountForms";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <>
      <AccountForms />
      <div style={{ textAlign: "center", marginTop: "-8px", paddingBottom: "24px" }}>
        <Link href="/guest" className="primary-btn">Continue as Guest</Link>
      </div>
    </>
  );
}
