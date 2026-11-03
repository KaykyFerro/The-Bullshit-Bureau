const encoder = new TextEncoder();
let cachedAccessToken = '';
let cachedAccessTokenUntil = 0;

const ALLOWED_ORIGINS = new Set([
  'https://localhost',
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:5173',
  'https://kaykyferro.github.io'
]);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin)
    }
  });
}

function base64Url(value) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem) {
  const base64 = pem.replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getFirebaseAccessToken(env) {
  if (cachedAccessToken && Date.now() < cachedAccessTokenUntil) return cachedAccessToken;
  if (!env.FIREBASE_SERVICE_ACCOUNT) throw new Error('FIREBASE_SERVICE_ACCOUNT secret is missing.');

  const service = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: service.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }));
  const unsigned = header + '.' + claims;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(service.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
  const assertion = unsigned + '.' + base64Url(signature);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  if (!response.ok) throw new Error('Firebase OAuth token request failed: ' + await response.text());
  const result = await response.json();
  cachedAccessToken = result.access_token;
  cachedAccessTokenUntil = Date.now() + Math.max(60, (result.expires_in || 3600) - 120) * 1000;
  return cachedAccessToken;
}

async function registerDevice(request, env, origin) {
  const payload = await request.json().catch(() => null);
  const token = typeof payload?.token === 'string' ? payload.token.trim() : '';
  const platform = payload?.platform;
  if (token.length < 40 || token.length > 8192 || !['android', 'ios'].includes(platform)) {
    return json({ error: 'Invalid device token or platform.' }, 400, origin);
  }
  await env.DB.prepare(
    'INSERT INTO devices (token, platform, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(token) DO UPDATE SET platform = excluded.platform, updated_at = CURRENT_TIMESTAMP'
  ).bind(token, platform).run();
  return json({ registered: true }, 201, origin);
}

async function unregisterDevice(request, env, origin) {
  const payload = await request.json().catch(() => null);
  const token = typeof payload?.token === 'string' ? payload.token.trim() : '';
  if (!token) return json({ error: 'Token is required.' }, 400, origin);
  await env.DB.prepare('DELETE FROM devices WHERE token = ?').bind(token).run();
  return json({ registered: false }, 200, origin);
}

async function sendPush(request, env) {
  const secret = env.PUSH_PUBLISH_SECRET;
  const authorization = request.headers.get('Authorization') || '';
  if (!secret || authorization !== 'Bearer ' + secret) {
    return json({ error: 'Unauthorized.' }, 401);
  }

  const payload = await request.json().catch(() => null);
  const title = String(payload?.title || 'The Bullshit Bureau').slice(0, 120);
  const body = String(payload?.body || 'Uma nova matéria foi publicada.').slice(0, 240);
  const slug = String(payload?.slug || '').slice(0, 160);
  const url = String(payload?.url || 'https://kaykyferro.github.io/The-Bullshit-Bureau/').slice(0, 500);
  if (!slug) return json({ error: 'Article slug is required.' }, 400);

  const service = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT || '{}');
  const projectId = env.FIREBASE_PROJECT_ID || service.project_id;
  if (!projectId) return json({ error: 'Firebase project ID is missing.' }, 500);
  const accessToken = await getFirebaseAccessToken(env);
  const rows = await env.DB.prepare('SELECT token FROM devices').all();
  const tokens = rows.results || [];
  let sent = 0;
  let removed = 0;

  for (const row of tokens) {
    const response = await fetch(
      'https://fcm.googleapis.com/v1/projects/' + encodeURIComponent(projectId) + '/messages:send',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            token: row.token,
            notification: { title, body },
            data: { slug, url },
            android: { priority: 'high', notification: { channel_id: 'news' } },
            apns: { payload: { aps: { sound: 'default' } } }
          }
        })
      }
    );
    if (response.ok) {
      sent += 1;
      continue;
    }
    const errorText = await response.text();
    if (/UNREGISTERED|registration-token-not-registered|INVALID_ARGUMENT/.test(errorText)) {
      await env.DB.prepare('DELETE FROM devices WHERE token = ?').bind(row.token).run();
      removed += 1;
    }
  }
  return json({ attempted: tokens.length, sent, removed });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    try {
      if (url.pathname === '/health' && request.method === 'GET') {
        return json({ service: 'the-bullshit-bureau-push', status: 'ok' }, 200, origin);
      }
      if (url.pathname === '/register' && request.method === 'POST') {
        return registerDevice(request, env, origin);
      }
      if (url.pathname === '/register' && request.method === 'DELETE') {
        return unregisterDevice(request, env, origin);
      }
      if (url.pathname === '/notify' && request.method === 'POST') {
        return sendPush(request, env);
      }
      return json({ error: 'Not found.' }, 404, origin);
    } catch (error) {
      console.error('Push worker error:', error);
      return json({ error: 'Internal push service error.' }, 500, origin);
    }
  }
};
