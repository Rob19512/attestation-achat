import { getStore } from '@netlify/blobs';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
  }

  try {
    const store = getStore('att-counters');

    const now = new Date();
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const key  = `${mm}-${yyyy}`;

    const raw  = await store.get(key);
    const next = (raw ? parseInt(raw, 10) : 0) + 1;
    await store.set(key, String(next));

    const num = String(next).padStart(3, '0');
    return new Response(
      JSON.stringify({ invoiceId: `${key}-${num}` }),
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur', detail: err.message }),
      { status: 500, headers: CORS }
    );
  }
}

export const config = { path: '/api/counter' };
