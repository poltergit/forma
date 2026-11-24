"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicSupabaseEnvironment } from "@/lib/env/public";
import styles from "./auth-form.module.css";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    if (!getPublicSupabaseEnvironment().configured) {
      setStatus("Cloud sync is not configured yet. Add the public Supabase URL and publishable key to this deployment.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const requested = searchParams.get("next");
        const next = requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/scene-studio";
        router.replace(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/scene-studio` },
        });
        if (error) throw error;
        setStatus(data.session
          ? "Account created. Opening your Scene Studio…"
          : "Check your inbox to confirm your email, then return here to sign in.");
        if (data.session) {
          router.replace("/scene-studio");
          router.refresh();
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.page}>
      <Link className={styles.brand} href="/"><span>F</span> FORMA <i>/</i> ACCOUNT</Link>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>YOUR WORK, WHEREVER YOU ARE</p>
        <h1>{mode === "sign-in" ? "Return to your forms." : "Make room to create."}</h1>
        <p className={styles.intro}>Sign in to keep your compositions synced between devices. Your scenes remain private to your account.</p>
        <div className={styles.switcher}>
          <button type="button" className={mode === "sign-in" ? styles.active : ""} onClick={() => { setMode("sign-in"); setStatus(""); }}>SIGN IN</button>
          <button type="button" className={mode === "sign-up" ? styles.active : ""} onClick={() => { setMode("sign-up"); setStatus(""); }}>CREATE ACCOUNT</button>
        </div>
        <form onSubmit={submit}>
          <label>EMAIL ADDRESS<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>PASSWORD<input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className={styles.submit} disabled={busy}>{busy ? "PLEASE WAIT…" : mode === "sign-in" ? "SIGN IN TO FORMA ↗" : "CREATE ACCOUNT ↗"}</button>
        </form>
        {status && <p className={styles.status} role="status">{status}</p>}
        <p className={styles.footnote}>Cloud storage requires a configured Supabase project. <Link href="/scene-studio">Continue with local scenes</Link>.</p>
      </section>
      <span className={styles.coordinates}>FORMA / SCENE STUDIO / CLOUD LIBRARY</span>
    </main>
  );
}
