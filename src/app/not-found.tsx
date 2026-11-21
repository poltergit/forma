import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="route-state">
      <p className="route-state__code">404 / OUT OF FRAME</p>
      <h1>This form doesn’t exist.</h1>
      <p>The page may have moved, or the shape was never here.</p>
      <Link href="/">Return to FORMA</Link>
    </main>
  );
}
