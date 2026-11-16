'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DIRECT_RATE, UPLINE_RATE, type HellobeeMember } from '@/types/hellobee';

interface NetworkTreeProps {
  members: HellobeeMember[];
  // The signed-in member, marked "You" in the tree.
  currentMemberId?: string;
  // Sale amount used for the payout preview.
  saleAmount?: number;
}

interface TreeNode {
  member: HellobeeMember;
  children: TreeNode[];
  downlineCount: number;
}

const money = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function buildTree(members: HellobeeMember[]): { roots: TreeNode[]; byId: Map<string, HellobeeMember> } {
  const byId = new Map(members.map((m) => [m.id, m]));
  const childrenOf = new Map<string, HellobeeMember[]>();
  const rootMembers: HellobeeMember[] = [];

  for (const member of members) {
    const parentId = member.referredById;
    // A member whose sponsor is not in this view (or who has none) starts a tree of their own.
    if (parentId && parentId !== member.id && byId.has(parentId)) {
      childrenOf.set(parentId, [...(childrenOf.get(parentId) ?? []), member]);
    } else {
      rootMembers.push(member);
    }
  }

  const visited = new Set<string>();
  const toNode = (member: HellobeeMember): TreeNode => {
    visited.add(member.id);
    const children = (childrenOf.get(member.id) ?? []).filter((c) => !visited.has(c.id)).map(toNode);
    return {
      member,
      children,
      downlineCount: children.reduce((sum, child) => sum + 1 + child.downlineCount, 0),
    };
  };

  return { roots: rootMembers.map(toNode), byId };
}

// The members who earn when `sellerId` makes a sale: the seller, then everyone above them.
function payoutChain(sellerId: string, byId: Map<string, HellobeeMember>): string[] {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: string | null | undefined = sellerId;

  while (current && byId.has(current) && !seen.has(current)) {
    chain.push(current);
    seen.add(current);
    current = byId.get(current)?.referredById;
  }

  return chain;
}

export function NetworkTree({ members, currentMemberId, saleAmount = 1500 }: NetworkTreeProps) {
  const { roots, byId } = useMemo(() => buildTree(members), [members]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const chain = useMemo(() => (selectedId ? payoutChain(selectedId, byId) : []), [selectedId, byId]);
  const chainIndex = useMemo(() => new Map(chain.map((id, index) => [id, index])), [chain]);

  const parentIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (node: TreeNode) => {
      if (node.children.length > 0) ids.push(node.member.id);
      node.children.forEach(walk);
    };
    roots.forEach(walk);
    return ids;
  }, [roots]);

  const toggle = (id: string) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (members.length === 0) {
    return <p className="text-xs text-[#777777] py-8 text-center">No network members to show yet.</p>;
  }

  const direct = saleAmount * DIRECT_RATE;
  const override = saleAmount * UPLINE_RATE;
  const selected = selectedId ? byId.get(selectedId) : undefined;
  // True when the top of the visible chain was itself introduced by someone outside this view.
  const uplineHidden = Boolean(chain.length && byId.get(chain[chain.length - 1])?.referredById);

  const renderNode = (node: TreeNode, depth: number) => {
    const { member, children } = node;
    const isCollapsed = collapsed.has(member.id);
    const position = chainIndex.get(member.id);
    const isSeller = position === 0;
    const isUpline = position !== undefined && position > 0;

    return (
      <li key={member.id} className="relative">
        <div className="flex items-center gap-1.5 py-1">
          {children.length > 0 ? (
            <button
              type="button"
              onClick={() => toggle(member.id)}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${member.name}'s team`}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-xs border border-[#E5E5E5] bg-white text-[#555555] hover:border-[#111111] hover:text-[#111111] transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="shrink-0 w-6 h-6 flex items-center justify-center" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCCCCC]" />
            </span>
          )}

          <button
            type="button"
            onClick={() => setSelectedId(selectedId === member.id ? null : member.id)}
            aria-pressed={selectedId === member.id}
            className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-left px-3 py-2 rounded-lg border transition-colors min-w-[260px] ${
              isSeller
                ? 'border-[#2D5A27] bg-[#EBF3EA]'
                : isUpline
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-[#E5E5E5] bg-white hover:border-[#111111]'
            }`}
          >
            <span className="flex flex-col">
              <span className="text-xs font-semibold text-[#111111] whitespace-nowrap">
                {member.name}
                {member.id === currentMemberId && (
                  <span className="ml-1.5 text-[10px] font-bold uppercase text-[#0055A5]">You</span>
                )}
              </span>
              <span className="text-[11px] text-[#777777] whitespace-nowrap">
                <span className="font-mono text-[#444444]">{member.referralCode}</span>
                {' · '}
                {member.role === 'OWNER' ? 'Owner' : `Rank ${member.rank}`}
                {' · Level '}
                {depth}
              </span>
            </span>

            <span className="text-[11px] text-[#777777] whitespace-nowrap">
              {member.validOrdersCount} sales
              {children.length > 0 && ` · ${children.length} direct · ${node.downlineCount} in team`}
            </span>

            {isSeller && (
              <span className="text-[11px] font-bold text-[#2D5A27] whitespace-nowrap">+{money(direct)} (10%)</span>
            )}
            {isUpline && (
              <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap">+{money(override)} (1%)</span>
            )}
            {!member.isActive && (
              <span className="text-[10px] font-bold uppercase text-[#B74747] whitespace-nowrap">Inactive</span>
            )}
          </button>
        </div>

        {children.length > 0 && !isCollapsed && (
          <ul className="ml-3 pl-6 border-l border-[#E5E5E5]">{children.map((child) => renderNode(child, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#666666] max-w-2xl">
          Each member sits under the person who introduced them. Select a member to see who earns when they sell a{' '}
          {money(saleAmount)} system: the seller earns 10% and every level above them earns 1%.
        </p>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setCollapsed(new Set())}
            className="px-2.5 py-1 border border-[#E5E5E5] rounded-xs text-[#555555] hover:border-[#111111] hover:text-[#111111]"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(new Set(parentIds))}
            className="px-2.5 py-1 border border-[#E5E5E5] rounded-xs text-[#555555] hover:border-[#111111] hover:text-[#111111]"
          >
            Collapse all
          </button>
        </div>
      </div>

      {selected && (
        <div className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg px-4 py-3 text-xs text-[#444444]" role="status">
          When <strong className="text-[#111111]">{selected.name}</strong> sells a {money(saleAmount)} system:{' '}
          <strong className="text-[#2D5A27]">{money(direct)}</strong> to the seller
          {chain.length > 1 && (
            <>
              {' and '}
              <strong className="text-amber-700">{money(override)}</strong> to each of the {chain.length - 1} level
              {chain.length > 2 ? 's' : ''} above
            </>
          )}
          .{' '}
          {uplineHidden ? (
            // A member only sees their own branch, so the levels above them cannot be counted here.
            <>Members above this branch also earn {money(override)} each.</>
          ) : (
            <>
              Total paid out: <strong className="text-[#111111]">{money(direct + override * (chain.length - 1))}</strong> (
              {Math.round((DIRECT_RATE + UPLINE_RATE * (chain.length - 1)) * 100)}% of the sale).
            </>
          )}
        </div>
      )}

      {/* Deep trees grow sideways, so the tree scrolls inside its own box instead of the page. */}
      <div className="overflow-x-auto border border-[#E5E5E5] rounded-lg bg-[#FCFCFB] p-4">
        <ul className="min-w-max">{roots.map((root) => renderNode(root, 0))}</ul>
      </div>
    </div>
  );
}
