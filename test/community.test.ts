/// <reference types="vitest/globals" />
import { vi } from 'vitest';
import { CODE_TTL_MS, mergeStored, useCommunityStore } from '../src/stores/useCommunityStore';

const person = { email: 'Buyer@Example.com', name: 'Buyer' };

describe('membership codes', () => {
  beforeEach(() => {
    useCommunityStore.setState({ codes: [], members: {} });
    vi.useRealTimers();
  });

  it('lets a valid code be used once', () => {
    const { code } = useCommunityStore.getState().createCode('Admin');
    expect(useCommunityStore.getState().redeemCode(person, code).ok).toBe(true);
    expect(useCommunityStore.getState().members['buyer@example.com']).toBeDefined();
    expect(useCommunityStore.getState().redeemCode({ email: 'b@example.com', name: 'B' }, code).ok).toBe(false);
  });

  it('rejects a code after 10 minutes', () => {
    vi.useFakeTimers();
    const { code } = useCommunityStore.getState().createCode('Admin');
    vi.advanceTimersByTime(CODE_TTL_MS + 1000);
    const result = useCommunityStore.getState().redeemCode(person, code);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/expired/i);
  });

  it('rejects an unknown code', () => {
    expect(useCommunityStore.getState().redeemCode(person, 'NOPE1234').ok).toBe(false);
  });
});

describe('chat', () => {
  it('builds the same direct-message id for both people', async () => {
    const { dmThreadId } = await import('../src/stores/useCommunityStore');
    expect(dmThreadId('A@x.com', 'b@x.com')).toBe(dmThreadId('b@x.com', 'a@x.com'));
  });

  it('puts the creator in a new group once', () => {
    const store = useCommunityStore.getState();
    const id = store.createGroup('Team', 'a@x.com', ['b@x.com', 'a@x.com']);
    const group = useCommunityStore.getState().groups.find((g) => g.id === id);
    expect(group?.memberEmails.sort()).toEqual(['a@x.com', 'b@x.com']);
  });
});

describe('guessing and damaged storage', () => {
  it('locks out after five wrong codes', () => {
    useCommunityStore.setState({ codes: [], members: {} });
    const store = useCommunityStore.getState();
    for (let i = 0; i < 5; i++) store.redeemCode({ email: 'g@x.com', name: 'G' }, 'WRONG123');
    const { code } = store.createCode('Admin');
    const result = store.redeemCode({ email: 'g@x.com', name: 'G' }, code);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/too many/i);
  });

  it('keeps defaults when stored data is the wrong shape', () => {
    const merged = mergeStored({ codes: 'x', members: [], posts: null }, useCommunityStore.getState());
    expect(merged.codes).toEqual(useCommunityStore.getState().codes);
    expect(Array.isArray(merged.members)).toBe(false);
    expect(Array.isArray(merged.posts)).toBe(true);
  });
});

describe('adding people to a group', () => {
  it('lets a member invite others and skips people already in', () => {
    const store = useCommunityStore.getState();
    const id = store.createGroup('Crew', 'a@x.com', ['b@x.com']);
    expect(store.addToGroup(id, 'A@x.com', ['b@x.com', 'C@x.com', 'c@x.com'])).toBe(1);
    const group = useCommunityStore.getState().groups.find((g) => g.id === id);
    expect(group?.memberEmails.sort()).toEqual(['a@x.com', 'b@x.com', 'c@x.com']);
  });

  it('refuses an outsider and unknown groups', () => {
    const store = useCommunityStore.getState();
    const id = store.createGroup('Closed', 'a@x.com', []);
    expect(store.addToGroup(id, 'outsider@x.com', ['d@x.com'])).toBe(0);
    expect(store.addToGroup('nope', 'a@x.com', ['d@x.com'])).toBe(0);
  });
});

describe('sample data', () => {
  it('ships with no meetings or posts', () => {
    expect(useCommunityStore.getInitialState().meetings).toEqual([]);
    expect(useCommunityStore.getInitialState().posts).toEqual([]);
  });

  it('drops sample items left in older storage and keeps what people created', () => {
    const merged = mergeStored(
      {
        meetings: [{ id: 'meet-seed-1' }, { id: 'meet-abc123' }],
        posts: [{ id: 'post-seed-2' }, { id: 'post-xyz789' }],
      },
      useCommunityStore.getState(),
    );
    expect(merged.meetings.map((m) => m.id)).toEqual(['meet-abc123']);
    expect(merged.posts.map((p) => p.id)).toEqual(['post-xyz789']);
  });

  it('removes sample items that arrive in a server snapshot', () => {
    useCommunityStore.getState().applySnapshot({
      meetings: [{ id: 'meet-seed-3' }, { id: 'meet-real' }] as never,
      posts: [{ id: 'post-seed-1' }] as never,
    });
    expect(useCommunityStore.getState().meetings.map((m) => m.id)).toEqual(['meet-real']);
    expect(useCommunityStore.getState().posts).toEqual([]);
  });
});
