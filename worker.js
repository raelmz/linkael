import { isValidUrl, isValidCode, RESERVED_CODES } from "./src/validators.js";

const RATE_LIMIT_MAX = 20; // requisições
const RATE_LIMIT_WINDOW_SECONDS = 60;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/shorten" && request.method === "POST") {
      return handleShorten(request, env, url);
    }

    if (url.pathname.startsWith("/api/stats/") && request.method === "GET") {
      const code = url.pathname.replace("/api/stats/", "");
      return handleStats(env, code);
    }

    if (url.pathname === "/" || url.pathname === "/style.css" || url.pathname === "/script.js") {
      return env.ASSETS.fetch(request);
    }

    return handleRedirect(request, env, url);
  }
};

/**
 * Rate limiting simples baseado em janela fixa, usando o próprio KV.
 * Evita abuso do endpoint de criação de links.
 */
async function checkRateLimit(env, request) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const key = `rl:${ip}`;
  const current = await env.LINKS.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= RATE_LIMIT_MAX) {
    return false;
  }

  await env.LINKS.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return true;
}

async function handleShorten(request, env, url) {
  const allowed = await checkRateLimit(env, request);
  if (!allowed) {
    return Response.json(
      { erro: "Muitas requisições em pouco tempo. Aguarde um instante e tente novamente." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const longUrl = body.url?.trim();
  const customCode = body.codigo?.trim();

  if (!isValidUrl(longUrl)) {
    return Response.json(
      { erro: "Informe uma URL válida começando com http:// ou https://." },
      { status: 400 }
    );
  }

  let code;

  if (customCode) {
    if (RESERVED_CODES.includes(customCode.toLowerCase())) {
      return Response.json(
        { erro: "Esse código é reservado. Escolha outro identificador." },
        { status: 400 }
      );
    }

    if (!isValidCode(customCode)) {
      return Response.json(
        { erro: "O código personalizado deve ter entre 3 e 20 caracteres, usando letras, números ou hífen." },
        { status: 400 }
      );
    }

    const existing = await env.LINKS.get(customCode);
    if (existing) {
      return Response.json(
        { erro: "Esse código já está em uso. Escolha outro identificador." },
        { status: 409 }
      );
    }

    code = customCode;
  } else {
    code = crypto.randomUUID().slice(0, 6);
  }

  const record = {
    url: longUrl,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  await env.LINKS.put(code, JSON.stringify(record));

  const shortLink = `${url.origin}/${code}`;
  return Response.json({ link: shortLink, codigo: code });
}

async function handleRedirect(request, env, url) {
  const code = url.pathname.slice(1);

  if (!code) {
    return env.ASSETS.fetch(request);
  }

  const raw = await env.LINKS.get(code);

  if (!raw) {
    return new Response(
      "Link não encontrado. Confira o código informado e tente novamente.",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const record = parseRecord(raw);
  record.clicks += 1;

  // Atualiza o contador sem bloquear o redirecionamento ao usuário.
  await env.LINKS.put(code, JSON.stringify(record));

  return Response.redirect(record.url, 302);
}

async function handleStats(env, code) {
  const raw = await env.LINKS.get(code);

  if (!raw) {
    return Response.json({ erro: "Código não encontrado." }, { status: 404 });
  }

  const record = parseRecord(raw);

  return Response.json({
    codigo: code,
    url: record.url,
    clicks: record.clicks,
    createdAt: record.createdAt
  });
}

/**
 * Faz o parse do registro salvo no KV. Mantém compatibilidade com
 * registros antigos, que eram salvos como string simples (apenas a URL).
 */
function parseRecord(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return { url: raw, clicks: 0, createdAt: null };
  }
}
