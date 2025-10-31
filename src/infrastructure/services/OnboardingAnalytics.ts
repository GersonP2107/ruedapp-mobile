import { supabase } from '../../../lib/supabase';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

export type OnboardingEventName =
  | 'session_started'
  | 'slide_viewed'
  | 'cta_pressed'
  | 'permissions_requested'
  | 'permissions_granted'
  | 'permissions_denied'
  | 'preferences_saved'
  | 'session_abandoned'
  | 'session_completed';

export interface OnboardingEvent {
  session_id: string;
  event: OnboardingEventName;
  step_index?: number; // 0-based index of the slide/step
  timestamp: string; // ISO
  duration_ms?: number; // only for completion/abandonment
  extra?: Record<string, any>;
  user_id?: string | null; // if user is logged in
}

/**
 * Lightweight analytics helper. It tries to persist events in Supabase
 * (table: onboarding_events). If the table does not exist or any error occurs,
 * it silently falls back to console logging so the app never breaks.
 */
export class OnboardingAnalytics {
  private static instance: OnboardingAnalytics | null = null;
  private sessionId: string | null = null;
  private sessionStartTs: number | null = null;

  static getInstance() {
    if (!OnboardingAnalytics.instance) {
      OnboardingAnalytics.instance = new OnboardingAnalytics();
    }
    return OnboardingAnalytics.instance;
  }

  async startSession(userId?: string | null) {
    // Generate a random session id
    const random = await Crypto.getRandomBytesAsync(16);
    const sessionId = Array.from(random)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    this.sessionId = sessionId;
    this.sessionStartTs = Date.now();

    await this.track('session_started', undefined, { appVersion: Constants.expoConfig?.version }, userId);

    return sessionId;
  }

  async track(event: OnboardingEventName, stepIndex?: number, extra?: Record<string, any>, userId?: string | null) {
    const payload: OnboardingEvent = {
      session_id: this.sessionId || 'no-session',
      event,
      step_index: stepIndex,
      timestamp: new Date().toISOString(),
      extra,
      user_id: userId ?? null,
    };

    try {
      // Try to persist to Supabase table
      const { error } = await supabase.from('onboarding_events').insert(payload);
      if (error) {
        // Fall back to console
        console.warn('[OnboardingAnalytics] Supabase insert failed:', error.message);
        console.log('[OnboardingAnalytics] Event:', payload);
      }
    } catch (err: any) {
      console.warn('[OnboardingAnalytics] Unexpected error:', err?.message ?? String(err));
      console.log('[OnboardingAnalytics] Event:', payload);
    }
  }

  async completeSession(completed: boolean, userId?: string | null) {
    const durationMs = this.sessionStartTs ? Date.now() - this.sessionStartTs : undefined;
    await this.track(completed ? 'session_completed' : 'session_abandoned', undefined, { duration_ms: durationMs }, userId);
  }
}