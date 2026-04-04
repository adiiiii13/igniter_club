export default function AuthStepIndicator({ steps, activeIndex }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-dark-400">
        <span>Signup Progress</span>
        <span>{activeIndex + 1} / {steps.length}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-dark-800/90">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ignite-600 via-ignite-500 to-ignite-300 transition-all duration-500"
          style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-dark-400">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`rounded-full border px-3 py-1 ${
              index === activeIndex
                ? 'border-ignite-400/60 bg-ignite-500/20 text-ignite-200'
                : 'border-white/10 bg-dark-900/80'
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
