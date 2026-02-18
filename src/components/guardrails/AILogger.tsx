import { Terminal } from 'lucide-react';

interface AILoggerProps {
  logs: string[];
}

export default function AILogger({ logs }: AILoggerProps) {
  return (
    <div className="bg-black/90 p-4 rounded-lg font-mono text-xs text-green-400 border border-green-500/30 shadow-2xl">
      <div className="flex items-center gap-2 mb-2 border-b border-green-500/20 pb-1">
        <Terminal size={14} /> <span>AGENTIC_REASONING_LOG</span>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {logs.map((log: string, i: number) => (
          <p key={i} className="leading-tight">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
          </p>
        ))}
        {logs.length === 0 && <p className="text-gray-600 italic">Waiting for pulse signal...</p>}
      </div>
    </div>
  );
}