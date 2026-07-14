export async function onRequestOptions() {
  return new Response(null, {
    headers: corsHeaders(),
  });
}

export async function onRequestGet(context) {
  const requestUrl = new URL(context.request.url);
  const target = requestUrl.searchParams.get('url');

  if (!target) {
    return textResponse('Missing url query parameter', 400);
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(target);
  } catch {
    return textResponse('Invalid url parameter', 400);
  }

  if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
    return textResponse('Only http and https URLs are allowed', 400);
  }

  if (isBlockedHost(parsedTarget.hostname)) {
    return textResponse('Target host is not allowed', 403);
  }

  try {
    const response = await fetch(parsedTarget.toString(), {
      headers: {
        Accept: 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
        'User-Agent': 'scte35-monitor/1.0',
      },
      redirect: 'follow',
    });

    const body = await response.text();

    if (!response.ok) {
      return textResponse(`Upstream error: HTTP ${response.status}`, response.status);
    }

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type':
          response.headers.get('content-type') ?? 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy fetch failed';
    return textResponse(message, 502);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function isBlockedHost(hostname) {
  const host = hostname.toLowerCase();

  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host === '::1'
  ) {
    return true;
  }

  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    return true;
  }

  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    return true;
  }

  return false;
}
