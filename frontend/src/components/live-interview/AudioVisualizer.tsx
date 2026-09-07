interface AudioVisualizerProps {
  level: number;
  active: boolean;
  label: string;
}

export function AudioVisualizer({
  level,
  active,
  label,
}: AudioVisualizerProps) {
  const bars = Array.from({ length: 16 }, (_, index) => {
    const base = 18 + (index % 4) * 6;
    const swing = active ? level * 0.8 : 8;
    const height = Math.max(base, Math.min(92, base + swing - index * 1.5));

    return {
      id: index,
      height,
    };
  });

  return (
    <div className="flex items-end gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner shadow-slate-200/80">
      {bars.map((bar) => (
        <span
          key={bar.id}
          aria-label={label}
          className={`w-1.5 rounded-full transition-all duration-200 ${
            active ? "bg-indigo-600" : "bg-slate-300"
          }`}
          style={{ height: `${bar.height}px` }}
        />
      ))}
    </div>
  );
}
