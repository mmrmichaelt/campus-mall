import Link from "next/link";
import AccountForms from "@/components/AccountForms";

export default function GuestPage() {
  return <>
      <AccountForms initialMode="guest" />
      <div style={{ textAlign: "center", marginTop: "-24px", paddingBottom: "24px" }}>
        <Link href="/join" className="primary-btn">Create Account</Link>
      </div>
    </>;
}
