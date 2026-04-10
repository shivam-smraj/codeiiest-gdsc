import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./CFHandleModal.css";

function cfRatingClass(rating) {
  if (!rating) return "";
  if (rating < 1200) return "newbie";
  if (rating < 1400) return "pupil";
  if (rating < 1600) return "specialist";
  if (rating < 1900) return "expert";
  if (rating < 2100) return "candidate-master";
  if (rating < 2400) return "master";
  return "grandmaster";
}
function cfRatingLabel(rating) {
  return cfRatingClass(rating).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Step 1: Google Sign-In ───────────────────────────────────────────────────
function StepSignIn({ auth }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const btnRef = useRef(null);

  function handleSignIn() {
    setLoading(true);
    setErr(null);
    auth.signInWithGoogle(
      () => setLoading(false),      // onSuccess: hook updates state → parent re-renders to next step
      (msg) => { setErr(msg); setLoading(false); }
    );
  }

  return (
    <>
      <div className="cf-modal-title">Add your CF Handle</div>
      <div className="cf-modal-subtitle">
        Sign in with your IIEST college email to link your Codeforces
        profile and appear on the leaderboard.
      </div>

      <button
        ref={btnRef}
        className="cf-google-btn"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? <span className="cf-spinner" /> : (
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {loading ? "Opening Google sign-in…" : "Continue with Google"}
      </button>

      {err && (
        <div className="cf-error">{err}</div>
      )}

      <p className="cf-note">
        Only <strong>@students.iiests.ac.in</strong> college emails are accepted.
        A Google popup will appear — no page navigation.
      </p>
    </>
  );
}

// ── Step 2: Set name + verify CF handle (ownership proven) ──────────────────
function StepProfile({ auth }) {
  const { user, lookupCFHandle, getCFVerifyCode, verifyCFHandle, updateName, clearToken } = auth;

  const [name, setName]               = useState(user?.name || "");
  const [handle, setHandle]           = useState("");
  const [cfPreview, setCFPreview]     = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError]     = useState(null);

  const [subStep, setSubStep]             = useState("handle");
  const [verifyCode, setVerifyCode]       = useState(null);
  const [codeLoading, setCodeLoading]     = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError]     = useState(null);
  const [countdown, setCountdown]         = useState(0); // seconds left before Verify is enabled

  const lookupTimer = useRef(null);

  // Start a 20-second countdown when the code sub-step becomes active
  useEffect(() => {
    if (subStep !== "code") return;
    setCountdown(20);
    const interval = setInterval(() => {
      setCountdown((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subStep]);

  // Auto-lookup CF handle as user types (debounced 600ms)
  useEffect(() => {
    setCFPreview(null);
    setLookupError(null);
    const trimmed = handle.trim();
    if (trimmed.length < 2) return;
    clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const data = await lookupCFHandle(trimmed);
        setCFPreview(data);
      } catch (e) {
        setLookupError(e.message || "Handle not found");
      } finally {
        setLookupLoading(false);
      }
    }, 600);
    return () => clearTimeout(lookupTimer.current);
  }, [handle, lookupCFHandle]);

  // Fetch the verification code and move to sub-step 2
  async function handleGetCode() {
    setCodeLoading(true);
    try {
      if (name.trim() && name.trim() !== user?.name) {
        await updateName(name.trim());
      }
      const code = await getCFVerifyCode();
      setVerifyCode(code);
      setSubStep("code");
    } catch (e) {
      setLookupError(e.message || "Failed to get code");
    } finally {
      setCodeLoading(false);
    }
  }

  // Attempt to verify by checking firstName on CF profile
  async function handleVerify() {
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      await verifyCFHandle(handle.trim());
      // Success — user state updated in hook → parent sees isCFVerified → moves to verified step
    } catch (e) {
      setVerifyError(e.message || "Verification failed");
      setVerifyLoading(false);
    }
  }

  const initial    = (user?.name || user?.email || "?")[0].toUpperCase();
  const ratingClass = cfPreview ? cfRatingClass(cfPreview.rating) : "";

  return (
    <>
      <div className="cf-modal-title">Connect Codeforces</div>
      <div className="cf-modal-subtitle">
        {subStep === "handle"
          ? "Enter your Codeforces handle to get started."
          : "Prove you own this handle — takes 30 seconds."}
      </div>

      {/* User info strip */}
      <div className="cf-profile-greeting">
        <div className="cf-profile-avatar">
          {user?.image
            ? <img src={user.image} alt={user.name} referrerPolicy="no-referrer" />
            : initial}
        </div>
        <div className="cf-profile-info">
          <div className="cf-profile-name">{user?.name || user?.email}</div>
          {user?.enrollmentNo && <div className="cf-profile-roll">#{user.enrollmentNo}</div>}
        </div>
      </div>

      {subStep === "handle" && (
        <>
          {/* Name field */}
          <div className="cf-field">
            <label>Your Name (shown on leaderboard)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              maxLength={60}
            />
          </div>

          {/* Handle field */}
          <div className="cf-field">
            <label>Codeforces Handle</label>
            <div className="cf-handle-input-wrap">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. tourist"
                maxLength={24}
                autoComplete="off"
                spellCheck={false}
              />
              {lookupLoading && (
                <span className="cf-handle-spinner">
                  <span className="cf-spinner" style={{ width: 14, height: 14 }} />
                </span>
              )}
            </div>
          </div>

          {lookupError && <div className="cf-error">{lookupError}</div>}

          {/* CF preview card */}
          {cfPreview && !lookupError && (
            <motion.div
              className="cf-preview-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {cfPreview.avatar && (
                <img className="cf-preview-avatar" src={cfPreview.avatar} alt={cfPreview.handle} />
              )}
              <div className="cf-preview-info">
                <div className="cf-preview-handle">{cfPreview.handle}</div>
                <div className={`cf-preview-rating ${ratingClass}`}>
                  {cfPreview.rating || "Unrated"}
                  {ratingClass && (
                    <span className="cf-preview-rank"> · {cfRatingLabel(cfPreview.rating)}</span>
                  )}
                </div>
              </div>
              <div className="cf-preview-tick">✓</div>
            </motion.div>
          )}

          <button
            className="cf-connect-btn"
            onClick={handleGetCode}
            disabled={codeLoading || !cfPreview || !name.trim()}
            style={{ marginTop: "1rem" }}
          >
            {codeLoading
              ? <span className="cf-spinner" />
              : <span className="material-icons" style={{ fontSize: "1.1rem" }}>verified_user</span>
            }
            {codeLoading ? "Getting code…" : "Verify I own this handle →"}
          </button>
        </>
      )}

      {subStep === "code" && verifyCode && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Instructions */}
          <div className="cf-verify-steps">
            <div className="cf-verify-step">
              <span className="cf-verify-num">1</span>
              <span>
                Go to{" "}
                <a
                  href="https://codeforces.com/settings/general"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cf-link"
                >
                  codeforces.com/settings
                </a>{" "}
                and set your <strong>First Name</strong> to this code:
              </span>
            </div>

            <div className="cf-code-box">
              <span className="cf-code-text">{verifyCode}</span>
              <button
                className="cf-code-copy"
                onClick={() => navigator.clipboard?.writeText(verifyCode)}
                title="Copy"
              >
                <span className="material-icons" style={{ fontSize: "1rem" }}>content_copy</span>
              </button>
            </div>

            <div className="cf-verify-step">
              <span className="cf-verify-num">2</span>
              <span>Click <strong>Save</strong> on Codeforces, then come back here and press Verify.</span>
            </div>

            <div className="cf-verify-step">
              <span className="cf-verify-num">3</span>
              <span>After verification succeeds, you can remove the code from your First Name.</span>
            </div>
          </div>

          {verifyError && <div className="cf-error">{verifyError}</div>}

          {/* Countdown message while Codeforces propagates the change */}
          {countdown > 0 && (
            <div className="cf-countdown">
              <span className="cf-spinner" style={{ width: 12, height: 12, borderWidth: 2, flexShrink: 0 }} />
              Waiting for Codeforces to update… <strong>{countdown}s</strong>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem" }}>
            <button
              className="cf-back-btn"
              onClick={() => { setSubStep("handle"); setVerifyError(null); }}
              disabled={verifyLoading}
            >
              ← Back
            </button>
            <button
              className="cf-connect-btn"
              style={{ flex: 1 }}
              onClick={handleVerify}
              disabled={verifyLoading || countdown > 0}
              title={countdown > 0 ? `Wait ${countdown}s before verifying` : ""}
            >
              {verifyLoading
                ? <span className="cf-spinner" />
                : <span className="material-icons" style={{ fontSize: "1.1rem" }}>check_circle</span>
              }
              {verifyLoading
                ? "Checking Codeforces…"
                : countdown > 0
                  ? `Verify Now (${countdown}s)`
                  : "Verify Now"}
            </button>
          </div>

          <p className="cf-note" style={{ marginTop: "0.9rem" }}>
            Handle being verified:{" "}
            <strong style={{ color: "var(--teal, #32b3c1)" }}>{handle}</strong>
          </p>
        </motion.div>
      )}

      <hr className="cf-divider" />
      <button className="cf-signout" onClick={clearToken}>Sign out</button>
    </>
  );
}

// ── Step 3: Already verified ─────────────────────────────────────────────────
function StepVerified({ auth }) {
  const { user, clearToken } = auth;
  const ratingClass = cfRatingClass(user?.codeforcesRating);

  return (
    <>
      <div className="cf-modal-title">CF Handle Linked ✅</div>
      <div className="cf-modal-subtitle">
        Your Codeforces profile is connected to your IIEST account.
      </div>

      <div className="cf-verified-badge">
        <div className="cf-verified-icon">
          {user?.codeforcesAvatar
            ? <img src={user.codeforcesAvatar} alt={user.codeforcesId} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            : "✅"}
        </div>
        <div className="cf-verified-handle">{user?.codeforcesId}</div>
        <div className="cf-verified-rating">
          Rating:{" "}
          <span className={`cf-rating-value ${ratingClass}`}>
            {user?.codeforcesRating || "—"}
          </span>
          {ratingClass && (
            <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 6 }}>
              · {cfRatingLabel(user?.codeforcesRating)}
            </span>
          )}
        </div>
        <Link className="cf-leaderboard-link" to="/leaderboard">
          <span className="material-icons" style={{ fontSize: "1rem" }}>leaderboard</span>
          View Leaderboard
        </Link>
      </div>

      <hr className="cf-divider" />
      <button className="cf-signout" onClick={clearToken}>Sign out</button>
    </>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function CFHandleModal({ open, onClose, auth }) {
  const { isSignedIn, isCFVerified, loading } = auth;

  // Derive step from auth state — no manual tracking needed
  const step = !isSignedIn ? "signin" : !isCFVerified ? "profile" : "verified";
  const STEPS = ["signin", "profile", "verified"];
  const stepIdx = STEPS.indexOf(step);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cf-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="cf-modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Logo */}
            <div className="cf-modal-logo">
              <img src="/assets/logo/codeiiest-logo.png" alt="CodeIIEST" />
              <div className="cf-modal-logo-text">
                <span>CodeIIEST</span>
                <span>CP Leaderboard</span>
              </div>
            </div>

            {/* Step indicators */}
            <div className="cf-steps">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`cf-step-dot ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`}
                />
              ))}
            </div>

            {/* Close */}
            <button className="cf-modal-close" onClick={onClose} aria-label="Close">
              <span className="material-icons">close</span>
            </button>

            {/* Loading while fetching /me after login */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "2.5rem 0", color: "rgba(255,255,255,0.4)" }}>
                <span className="cf-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                <div style={{ marginTop: "0.8rem", fontSize: "0.8rem" }}>Loading profile…</div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                >
                  {step === "signin"   && <StepSignIn  auth={auth} />}
                  {step === "profile"  && <StepProfile auth={auth} />}
                  {step === "verified" && <StepVerified auth={auth} />}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
