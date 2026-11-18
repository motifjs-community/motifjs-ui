// The live Chat demo's model. Not finished: the requests to Gemini's Interactions API and the events they stream are
// written once a real call shows their shape. Until then it says so.

interface Env {
  GEMINI_API_KEY: string;
  MODEL: string;
  ORIGINS: string;
  LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ORIGINS.split(',').includes(origin);
    const cors: Record<string, string> = allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: allowed ? 204 : 403, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }
    if (!allowed) return new Response('Not from the docs site.', { status: 403 });
    return new Response('Not ready yet.', { status: 501, headers: cors });
  }
};
