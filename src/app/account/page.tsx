import Link from "next/link";
import { getCurrentUser } from "../../lib/auth";
import AccountForms from "../../components/AccountForms";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="panel">
      <div className="section-title">
        <div>
          <p className="category">CAMPUS MALL</p>
          <h1>{user ? "Account overview" : "Join Campus Mall"}</h1>
          <p className="note">
            {user
              ? "View and manage your Campus Mall account and marketplace activity."
              : "Create an account as a student or outsider and select the campus you want to use."}
          </p>
        </div>
        {user && (
          <Link href="/profile" className="primary-btn">
            Edit profile
          </Link>
        )}
      </div>

      {user ? (
        <>
          <div className="profile-grid">
            <section className="panel">
              <div className="avatar-box">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <div className="avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h2>{user.name}</h2>
                <p className="note">{user.university}</p>
                <p className="note">
                  {user.country} ·{" "}
                  {user.accountType === "STUDENT" ? "Student" : "Outsider"}
                </p>
              </div>

              <div className="hero-actions" style={{ marginTop: 18 }}>
                <Link href="/profile" className="secondary-btn">
                  Edit profile
                </Link>
                <Link href="/settings" className="secondary-btn">
                  Settings
                </Link>
              </div>
            </section>

            <section className="panel">
              <p className="category">ACCOUNT INFORMATION</p>
              <h2>Your details</h2>

              <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
                <div>
                  <strong>Full name</strong>
                  <p className="note">{user.name}</p>
                </div>
                <div>
                  <strong>Email</strong>
                  <p className="note">{user.email || "Not provided"}</p>
                </div>
                <div>
                  <strong>Phone</strong>
                  <p className="note">{user.phone || "Not provided"}</p>
                </div>
                <div>
                  <strong>Country</strong>
                  <p className="note">{user.country || "Not provided"}</p>
                </div>
                <div>
                  <strong>University / College</strong>
                  <p className="note">{user.university || "Not provided"}</p>
                </div>
                <div>
                  <strong>Account type</strong>
                  <p className="note">
                    {user.accountType === "STUDENT" ? "Student" : "Outsider"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="panel" style={{ marginTop: 20 }}>
            <p className="category">MARKETPLACE</p>
            <h2>Account actions</h2>
            

            <div className="hero-actions" style={{ marginTop: 14 }}>
              <Link href="/sell" className="primary-btn">
                Add listing
              </Link>
              <Link href="/listings" className="secondary-btn">
                Browse marketplace
              </Link>
              <Link href="/chats" className="secondary-btn">
                Chats
              </Link>
              <Link href="/orders" className="secondary-btn">
                My orders
              </Link>
              <Link href="/cart" className="secondary-btn">
                Trolley / cart
              </Link>
              <Link href="/settings" className="secondary-btn">
                Settings
              </Link>
            </div>
          </section>

          
        </>
      ) : (
        <div className="auth-card">
          <AccountForms />
        </div>
      )}

      <div className="panel" style={{ marginTop: 20 }}>
        
        <a
          href="mailto:campusmall.support@gmail.com"
          className="text-link"
        >
          campusmall.support@gmail.com
        </a>
      </div>
    </div>
  );
}
