import Image from 'next/image';
import { Crown, Percent, Coins, Users, TrendingUp } from 'lucide-react';
import { LADDER_RANKS } from '@/types/hellobee';

const GENERATION_TABLE = [
  { level: 1, percent: '10%', commission: '$150', members: '5', total: '$750' },
  { level: 2, percent: '1%', commission: '$15', members: '25', total: '$375' },
  { level: 3, percent: '1%', commission: '$15', members: '125', total: '$1,875' },
  { level: 4, percent: '1%', commission: '$15', members: '625', total: '$9,375' },
  { level: 5, percent: '1%', commission: '$15', members: '3,125', total: '$46,875' },
  { level: 6, percent: '1%', commission: '$15', members: '15,625', total: '$234,375' },
];

const HEXAGON = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';

export function BenefitsPanel({ ladderLevel }: { ladderLevel: number }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Image
          src="/images/logo.png"
          alt="Hello Bee"
          width={640}
          height={612}
          className="h-28 sm:h-36 w-auto object-contain drop-shadow-md"
        />
      </div>

      <div className="rounded-2xl border-2 border-[#E0A82E] bg-[#FFF8E7] overflow-x-auto shadow-xs">
        <table className="w-full min-w-[640px] text-center text-sm">
          <thead className="bg-[#3A1B0A] text-[#F6C94C]">
            <tr>
              {[
                { label: 'Level', Icon: Crown },
                { label: 'Percent', Icon: Percent },
                { label: 'Commission', Icon: Coins },
                { label: 'Members Referred', Icon: Users },
                { label: 'Total', Icon: TrendingUp },
              ].map(({ label, Icon }) => (
                <th key={label} className="p-3 font-extrabold">
                  <Icon className="w-5 h-5 mx-auto mb-0.5" />
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-extrabold text-[#2A1206] text-base">
            {GENERATION_TABLE.map((row, i) => (
              <tr key={row.level} className={`border-t border-[#E0A82E]/50 ${i % 2 ? 'bg-[#FBE9A6]' : 'bg-[#FFF8E7]'}`}>
                <td className="p-2.5">
                  <span
                    className="inline-flex w-9 h-10 items-center justify-center bg-gradient-to-b from-[#F6C94C] to-[#B8781A] text-white text-lg"
                    style={{ clipPath: HEXAGON }}
                  >
                    <span
                      className="inline-flex w-7 h-8 items-center justify-center bg-[#5A2E0E]"
                      style={{ clipPath: HEXAGON }}
                    >
                      {row.level}
                    </span>
                  </span>
                </td>
                <td className="p-2.5">{row.percent}</td>
                <td className="p-2.5">{row.commission}</td>
                <td className="p-2.5">{row.members}</td>
                <td className="p-2.5">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border-2 border-[#E0A82E] bg-[#FFF8E7] overflow-x-auto shadow-xs">
        <table className="w-full min-w-[560px] text-center text-sm">
          <thead className="bg-[#3A1B0A] text-[#F6C94C]">
            <tr>
              <th className="p-3 font-extrabold">Rank</th>
              <th className="p-3 font-extrabold">Team Members</th>
              <th className="p-3 font-extrabold">One Time Reward</th>
              <th className="p-3 font-extrabold">Fixed Salary Monthly</th>
            </tr>
          </thead>
          <tbody className="font-extrabold text-[#2A1206]">
            {LADDER_RANKS.map((r, i) => (
              <tr
                key={r.level}
                className={`border-t border-[#E0A82E]/50 ${
                  r.level === ladderLevel ? 'bg-[#F6C94C]' : i % 2 ? 'bg-[#FBE9A6]' : 'bg-[#FFF8E7]'
                }`}
              >
                <td className="p-3">LV{r.level}</td>
                <td className="p-3">
                  {r.teamSize.toLocaleString('en-US')} {r.directOnly ? 'Direct Members' : 'Members'}
                </td>
                <td className="p-3">{r.level === 1 ? '$ Kangen Air' : `$${r.upgradeReward.toLocaleString('en-US')}`}</td>
                <td className="p-3">{r.monthlySalary ? `$${r.monthlySalary.toLocaleString('en-US')}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
