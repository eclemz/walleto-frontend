import type { AppView } from './Sidebar';

const mobileNav: { id: AppView; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Home', icon: '⊞' },
  { id: 'transactions', label: 'Activity', icon: '≡' },
  { id: 'send', label: 'Send', icon: '→' },
  { id: 'cards', label: 'Cards', icon: '▭' },
  { id: 'profile', label: 'Profile', icon: '◎' },
];

export function MobileNav({ active, onChange }: { active: AppView; onChange: (v: AppView) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E7EB] flex safe-area-pb lg:hidden">
      {mobileNav.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active === item.id ? 'text-[#3D3BF3]' : 'text-[#9CA3AF]'}`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
