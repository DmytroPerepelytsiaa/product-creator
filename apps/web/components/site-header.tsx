export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bar text-bar-ink">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-4 sm:px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold lowercase tracking-tight text-brand-ink">
          uni
        </span>
        <span className="text-sm font-semibold">Universe</span>
        <span className="text-bar-ink/30">/</span>
        <span className="text-sm text-bar-ink/70">Products</span>
      </div>
    </header>
  );
}
