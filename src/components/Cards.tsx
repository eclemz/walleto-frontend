import { useState } from 'react';
import { Card, Badge, Button, Toggle } from './ui';

const cards = [
  { id: 1, label: 'Primary', last4: '4829', expiry: '09/28', network: 'Visa', frozen: false, limit: 5000, spent: 1243.18 },
  { id: 2, label: 'Virtual', last4: '2201', expiry: '11/27', network: 'Mastercard', frozen: true, limit: 2000, spent: 0 },
];

export function Cards() {
  const [cardStates, setCardStates] = useState(cards.map(c => ({ ...c })));
  const [selected, setSelected] = useState(0);

  const toggle = (id: number) => {
    setCardStates(prev => prev.map(c => c.id === id ? { ...c, frozen: !c.frozen } : c));
  };

  const card = cardStates[selected];
  const spentPct = Math.round((card.spent / card.limit) * 100);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#F9FAFB]/90 backdrop-blur-sm border-b border-[#E5E7EB] px-8 h-14 flex items-center justify-between">
        <h1 className="text-base font-semibold text-[#0D0D0E]">Cards</h1>
        <Button size="sm" variant="secondary">+ Add virtual card</Button>
      </header>

      <div className="px-8 py-6 max-w-[800px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card selector */}
          <div className="space-y-3">
            {cardStates.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSelected(i)}
                className={`w-full text-left rounded-[16px] p-5 transition-all cursor-pointer ${i === selected ? 'ring-2 ring-[#3D3BF3]' : ''} ${c.frozen ? 'bg-[#F3F4F6]' : 'bg-[#0D0D0E]'}`}
              >
                <div className={`relative overflow-hidden ${c.frozen ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-widest ${c.frozen ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>{c.label}</p>
                      {c.frozen && <Badge variant="warning">Frozen</Badge>}
                    </div>
                    <span className={`text-lg font-bold italic ${c.frozen ? 'text-[#9CA3AF]' : 'text-white/80'}`}>{c.network}</span>
                  </div>
                  <p className={`font-mono-financial text-lg tracking-[0.2em] mb-4 ${c.frozen ? 'text-[#6B7280]' : 'text-white'}`}>
                    •••• •••• •••• {c.last4}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-xs ${c.frozen ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>Expires</p>
                      <p className={`text-sm font-mono-financial ${c.frozen ? 'text-[#6B7280]' : 'text-white'}`}>{c.expiry}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Card details */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[#0D0D0E] mb-4">{card.label} Card Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Freeze Card</p>
                    <p className="text-xs text-[#9CA3AF]">Block all transactions</p>
                  </div>
                  <Toggle checked={card.frozen} onChange={() => toggle(card.id)} />
                </div>
                <div className="border-t border-[#F3F4F6] pt-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#9CA3AF]">Monthly spend</span>
                    <span className="font-mono-financial font-semibold text-[#0D0D0E]">${card.spent.toLocaleString()} / ${card.limit.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3D3BF3] rounded-full transition-all" style={{ width: `${spentPct}%` }} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-1">{spentPct}% of monthly limit used</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[#0D0D0E] mb-3">Card Details</h3>
              <div className="space-y-0 divide-y divide-[#F3F4F6] text-sm">
                {[
                  { label: 'Card number', value: `•••• •••• •••• ${card.last4}` },
                  { label: 'Expiry', value: card.expiry },
                  { label: 'Network', value: card.network },
                  { label: 'Type', value: card.label },
                  { label: 'Status', value: card.frozen ? 'Frozen' : 'Active' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2.5">
                    <span className="text-[#9CA3AF]">{r.label}</span>
                    <span className="font-mono-financial text-[#374151]">{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" size="sm" className="flex-1">View PIN</Button>
              <Button variant="destructive" size="sm" className="flex-1">Report lost</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
