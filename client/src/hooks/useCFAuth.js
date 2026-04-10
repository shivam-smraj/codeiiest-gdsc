import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "codeiiest_cftoken";

// In dev: uses Vite proxy (vite.config.js routes /api/* → localhost:3000)
// In prod: set VITE_ADMIN_API_URL to the deployed admin panel
const ADMIN_URL =
  import.meta.env.VITE_ADMIN_API_URL || "";

/**
 * useCFAuth
 *
 * Manages the invisible auth flow between the GDSC public site and the
 * CodeIIEST Admin Panel. The admin panel URL is NEVER visible to the user.
 *
 * Google Sign-In:
 *   1. Load Google Identity Services (GIS) script dynamically
 *   2. Show Google popup on the GDSC domain
 *   3. POST the credential JWT to admin panel /api/public/auth/google
 *   4. Store the returned cftoken in localStorage
 *
 * CF Handle:
 *   1. User types their CF handle
 *   2. Admin panel /api/public/cf-lookup looks up CF profile
 *   3. User confirms → PATCH /api/public/me saves handle
 *   No redirects, no CF OAuth, admin panel fully invisible.
 */
export function useCFAuth() {
  const [token, setToken]   = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // ── Fetch profile whenever token changes ───────────────────────────────────
  useEffect(() => {
    if (!token) { setUser(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${ADMIN_URL}/api/public/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) { clearToken(); return null; }
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then((data) => { if (!cancelled && data) setUser(data); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [token]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearToken = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const saveToken = useCallback((t) => {
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t);
  }, []);

  // ── Google Sign-In (popup — admin panel URL never visible) ─────────────────
  /**
   * Loads Google Identity Services script, initialises it, and triggers the
   * Google popup. On success, POSTs credential to admin panel and stores token.
   *
   * onSuccess(name) — called after successful sign-in
   * onError(message) — called on failure
   */
  const signInWithGoogle = useCallback((onSuccess, onError) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      onError?.("Google Client ID not configured.");
      return;
    }

    const init = () => {
      window.google.accounts.id.initialize({
        client_id:    clientId,
        callback:     async ({ credential }) => {
          try {
            const res = await fetch(`${ADMIN_URL}/api/public/auth/google`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ credential }),
            });
            const data = await res.json();
            if (!res.ok) {
              onError?.(data.error || "Sign-in failed");
              return;
            }
            saveToken(data.token);
            onSuccess?.(data.name);
          } catch (e) {
            onError?.(e.message || "Network error");
          }
        },
        auto_select:  false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render a button if One Tap is blocked
          // The modal itself has a custom Google button, this is just a safety net
          onError?.("Google sign-in prompt was blocked. Please allow popups and try again.");
        }
      });
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const existing = document.getElementById("gis-script");
      if (existing) {
        existing.addEventListener("load", init, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id  = "gis-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = init;
      script.onerror = () => onError?.("Failed to load Google sign-in.");
      document.head.appendChild(script);
    }
  }, [saveToken]);

  // ── CF Handle verification (ownership-proven, no OAuth) ───────────────────

  /**
   * Fetches the unique verification code for this user.
   * Returns e.g. "IIEST-A3F29B1C"
   */
  const getCFVerifyCode = useCallback(async () => {
    if (!token) throw new Error("Not signed in");
    const r = await fetch(`${ADMIN_URL}/api/public/cf-verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Failed to get code");
    return data.code;
  }, [token]);

  /**
   * Fetches CF user info for display in the preview card only.
   * Returns { handle, rating, maxRating, rank, avatar } or throws.
   */
  const lookupCFHandle = useCallback(async (handle) => {
    const r = await fetch(
      `${ADMIN_URL}/api/public/cf-lookup?handle=${encodeURIComponent(handle)}`
    );
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Handle not found");
    return data;
  }, []);

  /**
   * Verifies ownership of the CF handle by checking that the user's
   * Codeforces "First Name" matches the unique code from getCFVerifyCode().
   * Only succeeds if the user has actually set their firstName on codeforces.com.
   * Saves handle to MongoDB on success.
   */
  const verifyCFHandle = useCallback(async (handle) => {
    if (!token) throw new Error("Not signed in");
    const r = await fetch(`${ADMIN_URL}/api/public/cf-verify`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ handle }),
    });
    const data = await r.json();
    if (!r.ok) {
      // Use the detailed error from the API (includes "found: X, expected: Y")
      throw new Error(data.error || "Verification failed");
    }
    setUser((prev) => prev ? {
      ...prev,
      codeforcesId:     data.handle,
      codeforcesRating: data.rating,
      codeforcesAvatar: data.avatar,
    } : prev);
    return data;
  }, [token]);

  /**
   * Updates the display name.
   */
  const updateName = useCallback(async (name) => {
    if (!token) throw new Error("Not signed in");
    const r = await fetch(`${ADMIN_URL}/api/public/me`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ name }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Failed to update name");
    setUser((prev) => prev ? { ...prev, name: data.name } : prev);
    return data.name;
  }, [token]);

  return {
    token, user, loading, error,
    isSignedIn:      !!token && !!user,
    isCFVerified:    !!(user?.codeforcesId),
    saveToken, clearToken,
    signInWithGoogle, lookupCFHandle, getCFVerifyCode, verifyCFHandle, updateName,
  };
}
