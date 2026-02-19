import { GraduationCap, Star } from 'lucide-react';

export default function EventCard({ eventType }: { eventType: string }) {
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
      <div className="bg-emerald-500 p-2 rounded-lg">
        <GraduationCap className="text-white" size={24} />
      </div>
      <div>
        <p className="text-[10px] text-emerald-500 font-black uppercase">Life Event Detected</p>
        <p className="text-white font-bold text-lg">{eventType}</p>
      </div>
      <Star className="ml-auto text-emerald-400 animate-pulse" />
    </div>
  );
}