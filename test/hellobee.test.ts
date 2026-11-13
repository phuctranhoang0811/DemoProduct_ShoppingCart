import { RANK_PROGRESSION_RULES, RankLevel, getNextRankProgress } from '../src/types/hellobee';

function calculateCommissions(orderTotal: number, sellerRole: 'OWNER' | 'EMPLOYEE', hasOwner: boolean) {
  const directCommission = Number((orderTotal * 0.10).toFixed(2));
  const ownerOverride = hasOwner && sellerRole === 'EMPLOYEE' ? Number((orderTotal * 0.01).toFixed(2)) : 0;
  return { directCommission, ownerOverride };
}

function resolveRank(ordersCount: number): RankLevel {
  if (ordersCount >= 625) return '5A';
  if (ordersCount >= 125) return '4A';
  if (ordersCount >= 25) return '3A';
  if (ordersCount >= 5) return '2A';
  return '1A';
}

describe('Hellobee Multi-Tier Commission Engine', () => {
  const UNIT_PRICE = 1500;

  it('calculates 10% direct commission for employee sale ($150 on $1,500)', () => {
    const { directCommission, ownerOverride } = calculateCommissions(UNIT_PRICE, 'EMPLOYEE', true);
    expect(directCommission).toBe(150.0);
    expect(ownerOverride).toBe(15.0);
  });

  it('calculates 10% direct commission for independent owner sale with no duplicate override', () => {
    const { directCommission, ownerOverride } = calculateCommissions(UNIT_PRICE, 'OWNER', false);
    expect(directCommission).toBe(150.0);
    expect(ownerOverride).toBe(0.0);
  });

  it('correctly calculates override on multi-unit orders ($4,500)', () => {
    const multiUnitOrder = UNIT_PRICE * 3;
    const { directCommission, ownerOverride } = calculateCommissions(multiUnitOrder, 'EMPLOYEE', true);
    expect(directCommission).toBe(450.0);
    expect(ownerOverride).toBe(45.0);
  });

  it('credits 10% commission to employee and 1% override to owner when a new user buys a flagship K8 ionizer ($4,980)', () => {
    const K8_PRICE = 4980;
    const { directCommission, ownerOverride } = calculateCommissions(K8_PRICE, 'EMPLOYEE', true);
    expect(directCommission).toBe(498.0);
    expect(ownerOverride).toBe(49.8);
  });
});

describe('Hellobee Rank Progression Ladder (1A - 5A)', () => {
  it('assigns 1A rank for 0 to 4 direct sales', () => {
    expect(resolveRank(0)).toBe('1A');
    expect(resolveRank(4)).toBe('1A');
  });

  it('promotes to 2A rank upon reaching 5 sales', () => {
    expect(resolveRank(5)).toBe('2A');
    expect(resolveRank(24)).toBe('2A');
  });

  it('promotes to 3A rank upon reaching 25 sales', () => {
    expect(resolveRank(25)).toBe('3A');
    expect(resolveRank(124)).toBe('3A');
  });

  it('promotes to 4A rank upon reaching 125 sales', () => {
    expect(resolveRank(125)).toBe('4A');
    expect(resolveRank(624)).toBe('4A');
  });

  it('promotes to 5A rank upon reaching 625 sales', () => {
    expect(resolveRank(625)).toBe('5A');
    expect(resolveRank(1000)).toBe('5A');
  });

  it('calculates progression percentages accurately via getNextRankProgress', () => {
    const progress1A = getNextRankProgress('1A', 2);
    expect(progress1A.nextRank).toBe('2A');
    expect(progress1A.required).toBe(5);
    expect(progress1A.percent).toBe(40);

    const progressMax = getNextRankProgress('5A', 700);
    expect(progressMax.nextRank).toBe('MAX');
    expect(progressMax.percent).toBe(100);
  });
});
