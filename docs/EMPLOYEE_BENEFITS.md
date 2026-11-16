# Employee Benefits — Hellobee Network Compensation Plan

> Scope: the **Employee Benefits** section of the employee workspace (`/employee`) and the commission engine behind it.
> Source: two handwritten plan sheets (generation commissions + LV1–LV10 rank ladder) mapped against the current codebase.
> Status: **Implemented with defaults** (see "Implementation notes" below). Open questions in §6 are still unconfirmed.

### Implementation notes
- 6-generation commissions: `recordReferralOrder` walks `referredById` up to 5 uplines at 1% (replaces the old owner-only override).
- LV1–LV10 ladder: `LADDER_RANKS` + `getTeamStats` in `src/types/hellobee.ts`. Team size is **derived** from the sponsor chain (active members), not stored.
- Upgrade rewards use **Plan B values only**; the LV1 "Kangen Air" reward is $0 until its value is confirmed. Paid in `registerHellobeeMember` when an upline reaches a new level.
- Monthly salary is **displayed** in the Employee Benefits tab but not yet paid out automatically.
- The legacy 1A–5A personal-order rank is left untouched; it runs alongside the LV ladder. Renaming is still a pending migration.
- Gen-bonus column from Plan A is not paid.

---

## 1. Base Unit

All figures assume the standard qualifying sale: the **Hellobee Water Ionizer & Filtration System** (`hellobee-filter-1500`, SKU `HB-1500`) at **$1,500**.

| Term | Meaning |
|------|---------|
| **MB** | Member: a customer/consultant who has purchased a $1,500 qualifying device |
| **Direct MB** | A member who registered with your referral code (generation 1) |
| **Team** | Every member in your downline, all generations combined |
| **Generation (Gen) N** | Members N sponsor-links below you |

---

## 2. Current Implementation (as of `1d5973e`)

| Feature | Where | Behavior |
|---------|-------|----------|
| Direct commission | `recordReferralOrder` — `src/stores/useCommerceStore.ts:1292` | Employee whose code is on the order earns **10%** of the order total |
| Owner override | `src/stores/useCommerceStore.ts:1350` | The employee's top-level **Owner** earns **1%** (one level only) |
| Rank ladder | `src/types/hellobee.ts:69`, store `:1313` | `1A → 5A` based on the employee's **personal** order count: 5 / 25 / 125 / 625 |
| Commission types | `src/types/hellobee.ts:27` | `DIRECT_10_PERCENT`, `OWNER_OVERRIDE_1_PERCENT` |
| Payout request | `requestPayout` — store `:1439`, modal in `src/app/employee/page.tsx:915` | Employee withdraws from `availableBalance`, owner approves |
| Benefits UI | `src/app/employee/page.tsx:822` | Static "Direct Commission Payout Matrix" (10% per device model) |

**Not implemented today:** commissions beyond one level, team-size tracking, one-time rank rewards, fixed monthly salary, Kangen product rewards.

---

## 3. Target Plan A — Generation Commissions (6 Levels)

Every $1,500 sale pays the seller 10% and up to five upline sponsors 1% each.

| Gen | Rate | Per Sale | Members at Full Duplication (×5) | Potential Earnings | Gen Bonus (one-time) |
|-----|------|----------|-----------------------------------|--------------------|----------------------|
| 1 (Direct) | 10% | $150 | 5 | $750 | Kangen product reward *(TBD — see §6)* |
| 2 | 1% | $15 | 25 | $375 | $150 |
| 3 | 1% | $15 | 125 | $1,875 | $500 |
| 4 | 1% | $15 | 625 | $9,375 | $1,000 |
| 5 | 1% | $15 | 3,125 | $46,875 | $5,000 |
| 6 | 1% | $15 | 15,625 | $234,375 | $10,000 |
| **Total** | | | **19,530** | **$293,625** | |

Rules:
- **Maximum payout per sale:** 10% + 5 × 1% = **15% ($225 per $1,500 device)**.
- Commissions walk up the `referredById` chain; stop early if the chain ends.
- "Members at Full Duplication" assumes every member sponsors exactly 5. It is a **theoretical ceiling**, not a projection, and must be labeled that way in the UI.
- Commissions are earned **only on a completed device sale** (order `Delivered` and `Paid`), never on registration alone.

---

## 4. Target Plan B — Rank Ladder (LV1–LV10)

Rank is based on **total team size** (all generations). Each rank pays a one-time upgrade reward once, plus a fixed monthly salary while the rank is held.

| Rank | Team Size Required | One-Time Upgrade Reward | Fixed Monthly Salary |
|------|--------------------|-------------------------|----------------------|
| LV1 | 5 direct MBs | Kangen product reward *(TBD)* | — |
| LV2 | 25 MBs | $100 | — |
| LV3 | 125 MBs | $500 | $50 |
| LV4 | 500 MBs | $1,000 | $100 |
| LV5 | 1,000 MBs | $2,000 | $200 |
| LV6 | 2,500 MBs | $5,000 | $500 |
| LV7 | 5,100 MBs | $10,000 | $1,000 |
| LV8 | 10,000 MBs | $20,000 | $2,000 |
| LV9 | 50,000 MBs | $30,000 | $3,000 |
| LV10 | 100,000 MBs | $40,000 | $4,000 |

Rules:
- LV1 requires **5 direct** members; LV2+ count the whole team.
- Upgrade rewards are paid **once per rank**, never again on re-qualification.
- Monthly salary is paid only while the member still meets the rank requirement at month close.

---

## 5. Implementation Changes

### Types (`src/types/hellobee.ts`)
```ts
export type RankLevel = 'LV0' | 'LV1' | 'LV2' | 'LV3' | 'LV4' | 'LV5' | 'LV6' | 'LV7' | 'LV8' | 'LV9' | 'LV10';

export type CommissionType =
  | 'DIRECT_10_PERCENT'
  | 'GENERATION_1_PERCENT'
  | 'GENERATION_BONUS'
  | 'RANK_UPGRADE_REWARD'
  | 'MONTHLY_SALARY';

export interface RankRule {
  rank: RankLevel;
  teamSize: number;
  directOnly: boolean;
  upgradeReward: number;
  monthlySalary: number;
}
```
Add `generation?: number` to `CommissionTransaction` and `teamSize`, `claimedRankRewards: RankLevel[]` to `HellobeeMember`.

### Engine (`recordReferralOrder`)
1. Pay 10% to the code owner (unchanged).
2. Walk `referredById` up to 5 more levels, paying 1% (`GENERATION_1_PERCENT`, `generation: 2..6`).
3. Increment `teamSize` for every upline; recompute rank from `RankRule[]`.
4. On rank-up, issue `RANK_UPGRADE_REWARD` if not already in `claimedRankRewards`.
5. Replace the `OWNER_OVERRIDE_1_PERCENT` branch — the owner is simply the top of the upline chain.

### Monthly salary
A `runMonthlySalary()` admin action in `/admin/hellobee` that creates one `MONTHLY_SALARY` transaction per qualifying member.

### Employee UI (`/employee`)
Add an **Employee Benefits** tab containing:
- Generation commission table (§3) with the member's actual count per generation next to the ceiling.
- Rank ladder (§4) with current rank highlighted and progress bar to next rank.
- Earnings breakdown by `commissionType`.
- Replace the hard-coded prices in the existing payout matrix (`page.tsx:839`) with values from `products` — they currently show $4,980 for the K8 while the catalog lists $5,890.

### Migration
Rename `1A–5A` → `LV1–LV10` across `src/app/(store)/hellobee/page.tsx`, `src/app/admin/hellobee/page.tsx`, `src/data/hellobeeMembers.ts`, `StoreHeader.tsx` nav label, and `AGENTS.md`. Bump the `hellobee_*_v1` storage keys to `v2` so old localStorage data is discarded.

---

## 6. Open Questions

1. **LV1 / Gen 1 reward:** the sheets say "Kangen Air" — which product SKU, and what is its dollar value for accounting?
2. **Conflicting bonus values:** Plan A gen bonuses (Gen 2 $150, Gen 5 $5,000) differ from Plan B rank rewards (LV2 $100, LV5 $2,000). Are both paid, or does Plan B replace Plan A's bonus column?
3. **Team size thresholds:** Plan A implies 625 at level 4; Plan B uses 500 for LV4. Confirm Plan B's numbers are final.
4. **Illegible values:** LV5 read as "1,000" and LV7 as "5,000" — confirm.
5. **Owners vs. employees:** do Owners follow the same ladder, or keep a separate override?
6. **Salary cadence:** monthly (per sheet) — confirm payout date (current UI says the 15th).

---

## 7. Compliance Guardrails

- Every payout must trace back to a **real product sale**. Rank rewards and salary are triggered by team size, which counts members who *bought a device* — never by sign-ups or deposits alone.
- Display earnings figures as **maximums with typical results**, not promises.
- No deposit-based, trading-signal, or investment-return mechanics belong in this plan.
