// Shown when a manually-selected display language couldn't be fetched (e.g.
// offline, or the request otherwise failed) and the menu is falling back to
// showing the business's original-language text instead — so that fallback
// is never mistaken for a real translation. Reuses the same warning-token
// banner pattern as offline-indicator.tsx (Constitution Principle V).
export function TranslationUnavailableBanner() {
  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-[0.8rem] text-warning-foreground"
    >
      Showing original text — translation isn&rsquo;t available right now.
    </div>
  );
}
