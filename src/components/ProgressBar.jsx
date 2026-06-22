export default function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full bg-[var(--muted)] rounded-full h-4 overflow-hidden">
      <div
        className="h-4 bg-[var(--danger)] transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}