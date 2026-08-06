import { redirect } from "next/navigation";
import { getCurrentParent, getActiveStudent } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";

export default async function RootPage() {
  const parent = await getCurrentParent();
  if (!parent) return <LandingPage />;

  const student = await getActiveStudent();
  if (!student) redirect("/students");

  redirect("/home");
}
