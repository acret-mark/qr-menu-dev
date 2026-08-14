export const metadata = { title: "Terms & Conditions — Hapag" };

/**
 * Minimal, honest placeholder — no legal Terms content existed anywhere in
 * the app when the marketing footer (FR-014) needed to link somewhere real
 * rather than a 404 or fabricated legal text (tasks.md T009's scope note).
 */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
      <p className="mt-4 text-muted-foreground">
        Hapag&apos;s full terms of service are being finalized. In the meantime, contact us
        directly with any questions about using the platform.
      </p>
    </main>
  );
}
