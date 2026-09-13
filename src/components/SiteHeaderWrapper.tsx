import { getCurrentUser } from "../lib/auth";
import SiteHeader from "./SiteHeader";

export default async function SiteHeaderWrapper() {
  const user = await getCurrentUser();

  return (
    <SiteHeader
      userName={user?.name ?? null}
      isVerified={
        Boolean(user?.emailVerified) &&
        Boolean(user?.phoneVerified)
      }
    />
  );
}
