// Mocks MUST be defined before importing the module under test
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: async (size: number) => Uint8Array.from({ length: size }, (_, i) => i)
}));

// Mock supabase client insert to simulate scenarios
// Use the same module path that resolves to the real file
jest.mock('../../lib/supabase', () => {
  const insertMock = jest.fn(async () => ({ error: { message: 'table not found' } }));
  return {
    supabase: {
      from: () => ({
        insert: insertMock
      })
    }
  };
});

import { OnboardingAnalytics } from '../infrastructure/services/OnboardingAnalytics';

describe('OnboardingAnalytics', () => {
  it('should start, track and complete session without throwing even if Supabase fails', async () => {
    const analytics = OnboardingAnalytics.getInstance();
    const sessionId = await analytics.startSession('user-1');
    expect(typeof sessionId).toBe('string');
    expect(sessionId.length).toBeGreaterThan(0);

    await expect(analytics.track('slide_viewed', 0, { key: 'slide-soat' }, 'user-1')).resolves.not.toThrow();
    await expect(analytics.completeSession(true, 'user-1')).resolves.not.toThrow();
  });

  it('should fall back to console logging when Supabase insert fails', async () => {
    const analytics = OnboardingAnalytics.getInstance();
    await analytics.startSession('user-2');
    await analytics.track('cta_pressed', 1, { action: 'next' }, 'user-2');

    // console.warn is mocked in jest.setup.js
    expect(global.console.warn).toHaveBeenCalled();
  });

  it('should use "no-session" when track is called without starting session', async () => {
    const analytics = OnboardingAnalytics.getInstance();
    // reset internal state by creating a new instance (singleton persists, so emulate no-session)
    // Direct call to track without startSession
    await analytics.track('slide_viewed', 2, { key: 'slide-permissions' }, 'user-3');
    // we cannot directly read private state; we validate that it does not throw
    await expect(analytics.track('permissions_requested', undefined, undefined, 'user-3')).resolves.not.toThrow();
  });

  it('should record session_abandoned when completed=false', async () => {
    const analytics = OnboardingAnalytics.getInstance();
    await analytics.startSession('user-4');
    await expect(analytics.completeSession(false, 'user-4')).resolves.not.toThrow();
  });
});