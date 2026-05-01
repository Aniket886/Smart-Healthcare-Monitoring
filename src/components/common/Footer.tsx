export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
      <p className="text-xs text-slate-500">
        Smart Healthcare Monitoring · IoT Case Study
      </p>
      <p className="text-xs text-slate-600">
        Developer{' '}
        <span className="text-slate-400 font-medium">Aniket Tegginamath</span>
        <span className="mx-2 text-slate-700">·</span>
        USN{' '}
        <span className="text-slate-400 font-mono">U23C01CA004</span>
      </p>
    </footer>
  )
}
