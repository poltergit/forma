"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          padding: "3rem",
          background: "#111214",
          color: "#f2f0ea",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main>
          <p style={{ color: "#c7f36b", fontFamily: "monospace" }}>
            FORMA / SYSTEM INTERRUPTION
          </p>
          <h1>The experience could not start.</h1>
          <p>An unexpected application error occurred.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              padding: "0.8rem 1rem",
              border: "1px solid #92938f",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
