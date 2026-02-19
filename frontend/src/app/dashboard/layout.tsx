import Sidebar from '@/components/guardrails/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1d] text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0f1d] to-[#0d1425]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}