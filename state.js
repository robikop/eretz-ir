// Cloudflare Pages Function — runs at /api/state
// Stores everything under one KV key so reads/writes are simple and atomic-ish.
// Bind a KV namespace named DROP_LOG_KV in your Pages project settings.

const KV_KEY = "drop-log-state-v1";

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const raw = await env.DROP_LOG_KV.get(KV_KEY);
    if (!raw) {
      return json({ start: null, checkins: {} });
    }
    return json(JSON.parse(raw));
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    // body shape: { start: ISOString, checkins: { [doseId]: ISOString } }
    const existingRaw = await env.DROP_LOG_KV.get(KV_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : { start: null, checkins: {} };

    const merged = {
      start: body.start !== undefined ? body.start : existing.start,
      checkins: body.checkins !== undefined ? body.checkins : existing.checkins,
    };

    await env.DROP_LOG_KV.put(KV_KEY, JSON.stringify(merged));
    return json(merged);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
