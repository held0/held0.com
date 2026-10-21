import type { Metadata } from "next";
import { headers } from "next/headers";
import { checkAdmin } from "../../lib/admin/auth";
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
  if (checkAdmin((await headers()).get("authorization")) !== "ok") {
    return <p className="admin">Kein Zugriff.</p>;
  }
  return <AdminApp initial={await listAbos()} today={todayBerlin()} />;
}
