import { writable } from 'svelte/store';
import { getAuthSession, login as loginRequest, logout as logoutRequest } from '$lib/api.js';

const SESSION_CHECK_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function createAuthStore() {
  const { subscribe, set, update } = writable({
    ready: false,
    authenticated: false,
    username: null,
    is_admin: false,
    cookie_secure: false,
    busy: false,
    error: ''
  });

  return {
    subscribe,
    async refresh() {
      update((state) => ({ ...state, busy: true, error: '' }));
      try {
        const session = await withTimeout(
          getAuthSession(),
          SESSION_CHECK_TIMEOUT_MS,
          'Session check timed out. Please try signing in again.'
        );
        set({
          ready: true,
          authenticated: session.authenticated,
          username: session.username ?? null,
          is_admin: session.is_admin ?? false,
          cookie_secure: session.cookie_secure ?? false,
          busy: false,
          error: ''
        });
      } catch (error) {
        set({
          ready: true,
          authenticated: false,
          username: null,
          is_admin: false,
          cookie_secure: false,
          busy: false,
          error: error?.message || 'Unable to verify the current session.'
        });
      }
    },
    async login(username, password) {
      update((state) => ({ ...state, busy: true, error: '' }));
      try {
        const session = await loginRequest(username, password);
        set({
          ready: true,
          authenticated: session.authenticated,
          username: session.username,
          is_admin: session.is_admin,
          cookie_secure: session.cookie_secure ?? false,
          busy: false,
          error: ''
        });
        return true;
      } catch (error) {
        set({
          ready: true,
          authenticated: false,
          username: null,
          is_admin: false,
          cookie_secure: false,
          busy: false,
          error: 'Incorrect username or password.'
        });
        return false;
      }
    },
    async logout() {
      update((state) => ({ ...state, busy: true, error: '' }));
      try {
        await logoutRequest();
      } finally {
        set({
          ready: true,
          authenticated: false,
          username: null,
          is_admin: false,
          cookie_secure: false,
          busy: false,
          error: ''
        });
      }
    }
  };
}

export const auth = createAuthStore();
