export default function ProgressBar({ value = 0, type }) {
  if (type == "avg") {
    return (
      <div className="w-full bg-[var(--muted)] rounded-full h-2 overflow-hidden">
        <div className="h-4 bg-[var(--primary)] transition-all duration-300" style={{ width: `${value}%` }} />
      </div>
    );
  }
  return (
    <div className="w-full bg-[var(--muted)] rounded-full h-4 overflow-hidden">
      <div className="h-4 bg-[var(--danger)] transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}
