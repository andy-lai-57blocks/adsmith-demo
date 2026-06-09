export default function SceneBadge({ num, title, color }: { num: string; title: string; color: string }) {
  const bgMap: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  const barMap: Record<string, string> = {
    amber: 'via-amber-300 to-amber-400',
    emerald: 'via-emerald-300 to-emerald-400',
    violet: 'via-violet-300 to-violet-400',
    indigo: 'via-indigo-300 to-indigo-400',
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`h-px flex-1 bg-gradient-to-r from-transparent ${barMap[color]}`} />
      <span className={`text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border ${bgMap[color]}`}>
        Scene {num} — {title}
      </span>
      <div className={`h-px flex-1 bg-gradient-to-r ${barMap[color]} to-transparent`} />
    </div>
  );
}
