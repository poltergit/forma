import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Account | FORMA",
  description: "Sign in to sync your FORMA compositions across devices.",
};

export default function SignInPage() {
  return <Suspense fallback={<main aria-busy="true">Loading account…</main>}><AuthForm /></Suspense>;
}
