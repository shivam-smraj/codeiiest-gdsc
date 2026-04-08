// src/hooks/useFetchCF.js
import { useState, useEffect } from "react";
import { fetchData } from "../api/apiservice";

const sortingFunc = (a, b) => {
    if (a.rating !== b.rating) return b.rating - a.rating;
    if (a.maxrating !== b.maxrating) return b.maxrating - a.maxrating;
    return a.handle.localeCompare(b.handle);
};

const parseUser = (user) => ({
    maxrating: user.maxRating || 0,
    rating:    user.rating    || 0,
    maxrank:   user.maxRank   || "unrated",
    rank:      user.rank      || "unrated",
    handle:    user.handle,
    avatar:    user.avatar && !user.avatar.includes("no-avatar.jpg") ? user.avatar : "",
});

// Delay helper to avoid CF rate limits between sequential requests
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try fetching a batch of handles from CF API.
 * Returns:
 *   - Array of parsed users on success
 *   - null on ANY error (so caller knows to fall back)
 */
const tryBatch = async (handles) => {
    if (!handles || handles.length === 0) return [];
    // checkHistoricHandles=true: finds renamed/historic handles too
    const url = `https://codeforces.com/api/user.info?handles=${handles.join(";")}&checkHistoricHandles=true`;
    try {
        const resp = await fetchData(url);
        if (resp?.result) return resp.result.map(parseUser);
        return [];
    } catch (_) {
        return null; // batch failed (bad handle or network)
    }
};

/**
 * Core fetcher: sequential batching with individual fallbacks.
 *
 * Strategy:
 * 1. Split handles into BATCH_SIZE groups.
 * 2. For each group, try as a single batch request (fast path).
 * 3. If that batch gets a 400 (bad handle in it), fall back to
 *    individual requests — one by one, with a small delay — to
 *    isolate which specific handle is invalid.
 * 4. Accumulate all valid results.
 *
 * This is SEQUENTIAL (no Promise.all) so we never flood CF API
 * with parallel requests, which causes rate-limiting and false failures.
 */
const BATCH_SIZE    = 40;   // handles per fast-path batch
const DELAY_BETWEEN = 150;  // ms between sequential individual requests

const fetchAllHandles = async (handles) => {
    const results = [];
    const invalid = [];

    for (let i = 0; i < handles.length; i += BATCH_SIZE) {
        const batch = handles.slice(i, i + BATCH_SIZE);

        // --- Fast path: try the whole batch ---
        const batchResult = await tryBatch(batch);

        if (batchResult !== null) {
            // All handles in this batch are valid
            results.push(...batchResult);
        } else {
            // At least one handle in this batch is invalid.
            // Fall back to individual sequential requests.
            console.warn(`[useFetchCF] Batch ${i}–${i + batch.length} failed; checking individually...`);

            for (const handle of batch) {
                const single = await tryBatch([handle]);
                if (single !== null && single.length > 0) {
                    results.push(...single);
                } else {
                    invalid.push(handle);
                }
                // Small delay between individual requests to respect CF rate limits
                await sleep(DELAY_BETWEEN);
            }
        }

        // Small gap between batches
        if (i + BATCH_SIZE < handles.length) await sleep(200);
    }

    if (invalid.length > 0) {
        console.warn(`[useFetchCF] ${invalid.length} handles not found on CF:`, invalid);
    }

    return results;
};

const CACHE_KEY      = "CFdata";
const CACHE_TIME_KEY = "CFload";
const CACHE_TTL      = 5 * 60 * 1000; // 5 minutes

/**
 * useFetchCF(handles)
 *
 * - Waits until handles[] is non-empty before hitting CF API.
 * - Uses sequential batching with individual fallback on 400s.
 * - No parallel CF requests → no rate-limiting → all valid handles load.
 * - Caches results in localStorage for 5 minutes.
 */
const useFetchCF = (handles) => {
    const [data,     setData]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [isCached, setIsCached] = useState("Data fetch successful");

    const getData = async (currentHandles) => {
        if (!currentHandles || currentHandles.length === 0) {
            setLoading(true); // stay in "loading" until handles arrive from admin API
            return;
        }

        const now      = Date.now();
        const lastLoad = parseInt(localStorage.getItem(CACHE_TIME_KEY) || "0");
        const cache    = localStorage.getItem(CACHE_KEY);
        const cacheHit = cache && (now - lastLoad < CACHE_TTL);

        if (cacheHit) {
            setData(JSON.parse(cache));
            setLoading(false);
            setIsCached("Showing cached result");
            return;
        }

        setLoading(true);
        setError(null);
        setIsCached("Data fetch successful");

        try {
            const results = await fetchAllHandles(currentHandles);
            const sorted  = results.sort(sortingFunc);

            setData(sorted);
            localStorage.setItem(CACHE_KEY,      JSON.stringify(sorted));
            localStorage.setItem(CACHE_TIME_KEY, String(now));
        } catch (err) {
            console.error("[useFetchCF] Unexpected error:", err);
            if (cache) {
                setData(JSON.parse(cache));
                setIsCached("Fetch failed — showing stale cache");
            } else {
                setError(err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Re-run whenever the handles list changes (critical: don't fire on mount with [])
    useEffect(() => {
        getData(handles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(handles)]);

    return { data, loading, error, isCached, getData };
};

export default useFetchCF;
