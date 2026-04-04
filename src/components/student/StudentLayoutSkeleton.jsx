export default function StudentLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-dark-950 animate-pulse">
      <div className="flex">
        <aside className="hidden lg:flex w-64 h-screen border-r border-white/5 bg-dark-900/60 p-4">
          <div className="w-full">
            <div className="h-10 w-40 rounded-lg bg-white/10" />
            <div className="mt-8 space-y-3">
              <div className="h-11 rounded-xl bg-white/10" />
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
            </div>
            <div className="mt-auto pt-8">
              <div className="h-28 rounded-xl bg-white/5" />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="border-b border-white/5 bg-dark-900/50 px-4 py-4 sm:px-6">
            <div className="h-6 w-52 rounded bg-white/10" />
            <div className="mt-2 h-3 w-72 rounded bg-white/5" />
          </div>

          <div className="px-4 py-6 sm:px-6">
            <div className="h-28 rounded-xl border border-white/10 bg-dark-900/60" />

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="h-52 rounded-xl border border-white/10 bg-dark-900/60" />
              <div className="h-52 rounded-xl border border-white/10 bg-dark-900/60" />
              <div className="h-52 rounded-xl border border-white/10 bg-dark-900/60" />
            </div>

            <div className="mt-8">
              <div className="h-6 w-32 rounded bg-white/10" />
              <div className="mt-4 h-10 w-64 rounded bg-white/5" />
              <div className="mt-4 space-y-3">
                <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
                <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
                <div className="h-16 rounded-xl border border-white/10 bg-dark-900/60" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
