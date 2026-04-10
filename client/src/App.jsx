import { useState, useEffect } from "react";
import "./App.css";
import AllRoutes from "./Routes.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
// import News from "./components/News/News.jsx";
import IconLoader from "./components/iconloader/IconLoader.jsx";
import Header from "./components/header/Header.jsx";
// import { AnimationProvider } from "../AnimationContext.jsx";
import { Analytics } from "@vercel/analytics/react";
import { useCFAuth } from "./hooks/useCFAuth";
import { createClient } from "@supabase/supabase-js";
// SAFE DEBUG: do NOT print secrets, only presence booleans
try {
  // Vite: import.meta.env
  const viteUrl = typeof import.meta !== 'undefined' ? !!import.meta.env?.VITE_SUPABASE_URL : false;
  const viteRole = typeof import.meta !== 'undefined' ? !!import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY : false;

  console.info("[ENV-PRESENCE]", { viteUrl, viteRole });
} catch (e) {
  console.info("[ENV-PRESENCE] failed", e);
}

function makeSupabaseClient(url, key) {
  if (!url || !key) {
    console.warn(
      "Supabase env missing (or empty). Supabase tracking disabled; will fallback to beacon if available."
    );
    return null;
  }
  try {
    return createClient(url, key);
  } catch (e) {
    console.warn("Failed to create Supabase client.", e);
    return null;
  }
}
const App = () => {
    const [Loading, setLoading] = useState(true);

    // ── CF Handle modal state ──────────────────────────────────────────────
    const cfAuth = useCFAuth();
    const [cfModalOpen, setCFModalOpen] = useState(false);

    useEffect(() => {
        if (Loading) {
            setTimeout(() => {
                console.log("hello");
                console.log(Loading);
                setLoading(false);
            }, 4000);
        }

        function toISTISOString(d = new Date()) {
            const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            const ist = new Date(utc + 11 * 60 * 60 * 1000);
            const pad = (n) => String(n).padStart(2, "0");
            const Y = ist.getFullYear();
            const M = pad(ist.getMonth() + 1);
            const D = pad(ist.getDate());
            const h = pad(ist.getHours());
            const m = pad(ist.getMinutes());
            const s = pad(ist.getSeconds());
            return `${Y}-${M}-${D}T${h}:${m}:${s}+05:30`;
        }

        async function waitForEnv(timeoutMs = 10000, intervalMs = 200) {
          const start = Date.now();
          while (Date.now() - start < timeoutMs) {
            try {
              const url = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env.VITE_SUPABASE_URL : null;
              const key = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY : null;
              if (url && key) return { url, key };
            } catch (e) {
            }
            await new Promise((r) => setTimeout(r, intervalMs));
          }
          return null;
        }

        (async () => {
            try {
                const env = await waitForEnv(10000, 200);
                let supabase = null;

                if (env) {
                  console.info("[TRACKING] Supabase envs present, creating client.");
                  supabase = makeSupabaseClient(env.url, env.key);
                  if (!supabase) {
                    console.warn("[TRACKING] createClient returned null despite envs present.");
                  }
                } else {
                  // envs never appeared in time
                  console.warn("[TRACKING] Supabase envs not found within timeout. Falling back to beacon-only path.");
                }

                const ts = toISTISOString();
                let ip = null;

                try {
                  const r = await fetch("https://api.ipify.org?format=json");
                  if (r.ok) {
                    const json = await r.json();
                    ip = json.ip || null;
                  }
                } catch (e) {
                  // ip fetch failed — proceed without IP
                }

                const payload = { ts: ts, ip: ip };

                if (supabase) {
                  try {
                    const { error } = await supabase.from("ip_logs").insert([payload]);
                    if (error) {
                      console.warn("supabase insert err:", error);
                      // fallback to beacon below
                    } else {
                      // inserted ok
                      return;
                    }
                  } catch (e) {
                    console.warn("supabase insert threw:", e);
                    // continue to fallback
                  }
                }

                // fallback beacon if supabase not available or insert failed
                try {
                  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon("/api/tracker", blob);
                  } else {
                    await fetch("/api/tracker", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                      keepalive: true,
                    }).catch(()=>{});
                  }
                } catch (e) {
                  console.warn("beacon fallback failed", e);
                }

            } catch (e) {
                console.warn("tracking failed", e);
            }
        })();
    }, []);
    
    return (
        <div className="app">
            <Analytics />
            <Router>
                <IconLoader />
                <div className={"animate" + (Loading?" paused-animation":" run-animation")}>
                    <Navbar
                        cfAuth={cfAuth}
                        cfModalOpen={cfModalOpen}
                        onCFModalOpen={() => setCFModalOpen(true)}
                        onCFModalClose={() => setCFModalOpen(false)}
                    />
                    <Header
                        cfAuth={cfAuth}
                        onCFModalOpen={() => setCFModalOpen(true)}
                    />
                    <div className="frame">
                        <img src="/assets/frame.png" alt="" />
                    </div>
                    {/* <div className="page">
                    <div className="outer-content">
                        <div className="inner-content">
                            
                        </div>
                    </div>
                </div> */}
                    <AllRoutes></AllRoutes>
                </div>
            </Router>
        </div>
    );
};

export default App;
