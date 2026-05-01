interface FooterProps {
  centered?: boolean
}

export default function Footer({ centered = false }: FooterProps) {
  return (
    <footer className={`border-t border-slate-800 bg-slate-900/50 px-4 py-2.5 ${centered ? 'text-center' : ''}`}>
      <p className="text-xs text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">
        <span className="text-slate-500">Smart Health Monitor</span>
        <span className="mx-1.5 text-slate-700">·</span>
        <span className="text-slate-500">Developer</span>{' '}
        <span className="text-slate-400 font-medium">Aniket Tegginamath</span>
        <span className="mx-1.5 text-slate-700">·</span>
        <span className="text-slate-500">USN</span>{' '}
        <span className="text-slate-400 font-mono tracking-wide">U23C01CA004</span>
      </p>
    </footer>
  )
}
