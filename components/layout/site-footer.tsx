export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-page-bg text-midnight/70">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="border-t border-midnight/15" />
        <div className="py-6 text-center text-xs sm:text-sm">
          <p>© {year} VeraLearning. All rights reserved.</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-t-full bg-synapse" />
    </footer>
  );
}
