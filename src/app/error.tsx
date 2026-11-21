"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to the configured error reporter when one is introduced.
    console.error("FORMA route error", error);
  }, [error]);

  return (
    <main id="main-content" className="route-state" role="alert">
      <p className="route-state__code">UNEXPECTED INTERRUPTION</p>
      <h1>The experience paused.</h1>
      <p>Something went wrong while loading this view.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
