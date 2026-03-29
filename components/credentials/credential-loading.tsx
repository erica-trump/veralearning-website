function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/70 ${className}`} />;
}

export function CredentialLoading() {
  return (
    <div className="mx-auto max-w-[720px] px-5 pb-20 pt-8">
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="bg-[linear-gradient(160deg,#0D2B45_0%,#1A4A6E_100%)] px-7 py-8 text-center">
          <div className="mx-auto mb-5 h-3 w-40 rounded-full bg-white/15" />
          <div className="mx-auto mb-4 h-40 w-40 rounded-[24px] bg-white/10" />
          <div className="mx-auto mb-3 h-3 w-64 rounded-full bg-white/15" />
          <div className="mx-auto h-8 w-72 rounded-full bg-white/15" />
        </div>

        <div className="border-b border-[#2D7A4F]/10 bg-[#EBF5EF] px-7 py-3">
          <div className="mx-auto h-3 w-56 rounded-full bg-[#2D7A4F]/10" />
        </div>

        <div className="space-y-5 px-7 py-6">
          <SkeletonBlock className="h-[72px] w-full border border-[#E2E0DB]" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-8 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-40 rounded-full" />
            <SkeletonBlock className="h-8 w-36 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full rounded-none" />
            ))}
          </div>
          <SkeletonBlock className="h-28 w-full" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <SkeletonBlock className="h-56 w-full" />
        <SkeletonBlock className="h-64 w-full" />
        <SkeletonBlock className="h-40 w-full" />
      </div>
    </div>
  );
}
