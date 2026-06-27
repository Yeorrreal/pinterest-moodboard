// Pinterest RSS CORS 프록시 — Cloudflare Worker
// 배포: https://dash.cloudflare.com → Workers → 새 Worker → 이 코드 붙여넣기

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const { searchParams } = new URL(request.url);
    const target = searchParams.get('url');

    if (!target) {
      return new Response('Missing ?url= parameter', { status: 400, headers: corsHeaders() });
    }
    if (!target.startsWith('https://www.pinterest.com')) {
      return new Response('Only pinterest.com URLs allowed', { status: 403, headers: corsHeaders() });
    }

    try {
      const res = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
        }
      });
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': res.headers.get('Content-Type') || 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
        }
      });
    } catch (err) {
      return new Response('Fetch failed: ' + err.message, { status: 502, headers: corsHeaders() });
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
}
