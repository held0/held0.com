import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, LOGIN_PATH, verifySession } from "../../lib/admin/auth";
import { listAbos } from "../../lib/admin/store";
import { todayBerlin } from "../../lib/admin/calc";
import AdminApp from "./AdminApp";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abos – held0 admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  // proxy.ts prüft bereits; hier nur zur Sicherheit noch einmal
  if (!(await verifySession((await cookies()).get(COOKIE)?.value))) redirect(LOGIN_PATH);
  return <AdminApp initial={await listAbos()} today={todayBerlin()} />;
}
