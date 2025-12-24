import { UserDashboardLayoutClient } from "./UserDashboardLayoutClient";

export async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return <UserDashboardLayoutClient>{children}</UserDashboardLayoutClient>;
}

