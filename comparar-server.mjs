#!/usr/bin/env node
// comparar-server.mjs — Servidor local del comparador de precios

import https from 'https';
import http from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE  = join(__dir, 'comparar.config.json');
const TOKEN_CACHE   = join(__dir, '.ml_token_cache.json');
const ML_PRICES_FILE = join(__dir, 'ml_precios.json');
const PORT = 3737;

function formatPesos(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function httpRequest(hostname, path, method = 'GET', body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json', ...extraHeaders };
    if (body) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = Buffer.byteLength(body); }
    const req = https.request({ hostname, path, method, headers }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function httpForm(hostname, path, formBody) {
  const encoded = new URLSearchParams(formBody).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(encoded), 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(encoded);
    req.end();
  });
}

function parseJson(text) {
  const idx = text.indexOf('{');
  if (idx < 0) throw new Error('Respuesta inesperada');
  return JSON.parse(text.slice(idx));
}

// ── Electroestrada session ────────────────────────────────────────────────────

let sessionCookies = null;
let loginPromise   = null;

async function loginEstrada(email, password) {
  const payload = JSON.stringify({ email, pass: password });
  const res = await httpRequest('www.electroestrada.com.ar', '/api/login', 'POST', payload);
  const cookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
  let data;
  try { data = parseJson(res.body); } catch { throw new Error(`Login fallido (HTTP ${res.status})`); }
  if (data.success === false) throw new Error(`Credenciales incorrectas: ${data.msg || ''}`);
  return cookies;
}

async function getSession(config) {
  if (sessionCookies) return sessionCookies;
  if (!loginPromise) {
    loginPromise = loginEstrada(config.email, config.password)
      .then(c => { sessionCookies = c; loginPromise = null; return c; })
      .catch(e => { loginPromise = null; throw e; });
  }
  return loginPromise;
}

async function getEstradaProduct(codigo, config) {
  const cookies = await getSession(config);
  const payload = JSON.stringify({ search_q: codigo });
  const res = await httpRequest('www.electroestrada.com.ar', '/api/producto', 'POST', payload, { Cookie: cookies });
  let data;
  try { data = parseJson(res.body); } catch { return null; }
  if (data.listado?.[0]) return data.listado[0];
  sessionCookies = null;
  const cookies2 = await getSession(config);
  const res2 = await httpRequest('www.electroestrada.com.ar', '/api/producto', 'POST', payload, { Cookie: cookies2 });
  try { data = parseJson(res2.body); } catch { return null; }
  return data.listado?.[0] ?? null;
}

function productToJson(prod) {
  const slug = `${prod.nombre_marca} ${prod.nombre_cat} ${prod.codigo}`
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const apps = (prod.aplicaciones?.aplicacion_vehiculo || [])
    .map(a => ({ nombre_marca: a.nombre_marca, modelo: a.modelo, detalle: a.detalle }));
  return {
    codigo: prod.codigo, nombre_marca: prod.nombre_marca, nombre_cat: prod.nombre_cat,
    stock: prod.stock, meses_stock: prod.meses_stock,
    precio: prod.precio, precio_venta: prod.precio_markup1,
    precio_fmt: formatPesos(prod.precio), precio_venta_fmt: formatPesos(prod.precio_markup1),
    atributos: (prod.atributos || []).filter(a => a.visible), aplicaciones: apps,
    thumb: prod.thumb || null,
    estradaUrl: `https://www.electroestrada.com.ar/productos?data=${prod.codigo}`,
    mlUrl: `https://listado.mercadolibre.com.ar/${slug}`,
  };
}

// ── MercadoLibre search ───────────────────────────────────────────────────────

function loadCachedToken() {
  if (!existsSync(TOKEN_CACHE)) return null;
  try {
    const c = JSON.parse(readFileSync(TOKEN_CACHE, 'utf8'));
    if (c.expires_at && Date.now() < c.expires_at - 60_000) return c.access_token;
  } catch {}
  return null;
}

function saveToken(token, expiresIn) {
  try { writeFileSync(TOKEN_CACHE, JSON.stringify({ access_token: token, expires_at: Date.now() + expiresIn * 1000 })); } catch {}
}

async function getMlToken(clientId, clientSecret) {
  const cached = loadCachedToken();
  if (cached) return cached;
  const res = await httpForm('api.mercadolibre.com', '/oauth/token', {
    grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret,
  });
  let data;
  try { data = JSON.parse(res.body); } catch { throw new Error('ML OAuth: respuesta inválida'); }
  if (!data.access_token) throw new Error(`ML OAuth falló: ${data.message || data.error || JSON.stringify(data)}`);
  saveToken(data.access_token, data.expires_in || 21600);
  return data.access_token;
}

async function searchML(query, mlToken) {
  const path = `/sites/MLA/search?q=${encodeURIComponent(query)}&limit=10&sort=price_asc&status=active`;
  const res = await httpRequest('api.mercadolibre.com', path, 'GET', null, { 'Authorization': `Bearer ${mlToken}` });
  if (res.status !== 200) return { ok: false, status: res.status, body: res.body.slice(0, 200) };
  let data;
  try { data = JSON.parse(res.body); } catch { return { ok: false }; }
  const results = (data.results || [])
    .filter(r => r.condition === 'new')
    .slice(0, 6)
    .map(r => ({ titulo: r.title, precio: r.price, vendedor: r.seller?.nickname ?? '?', ventas: r.sold_quantity ?? 0, url: r.permalink }));
  return { ok: true, results };
}

// ── ML prices persistence ─────────────────────────────────────────────────────

function loadMlPrecios() {
  if (!existsSync(ML_PRICES_FILE)) return {};
  try { return JSON.parse(readFileSync(ML_PRICES_FILE, 'utf8')); } catch { return {}; }
}

function saveMlPrecio(codigo, precio) {
  const prices = loadMlPrecios();
  if (precio > 0) prices[codigo] = precio; else delete prices[codigo];
  try { writeFileSync(ML_PRICES_FILE, JSON.stringify(prices, null, 2)); } catch {}
  return prices;
}

// ── HTML ──────────────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Comparador — Electromóvil</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 24px 16px 60px; }
h1 { text-align: center; font-size: 1.2rem; font-weight: 600; color: #64748b; margin-bottom: 18px; letter-spacing: .07em; text-transform: uppercase; }
.tabs { display: flex; justify-content: center; gap: 4px; margin-bottom: 26px; }
.tab-btn { background: #1e293b; border: 1.5px solid #334155; border-radius: 9px; padding: 9px 24px; font-size: .88rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all .18s; }
.tab-btn:hover { border-color: #3b82f6; color: #93c5fd; }
.tab-btn.active { background: #1d4ed8; border-color: #2563eb; color: #fff; }

/* Search view */
.search-wrap { display: flex; gap: 8px; max-width: 520px; margin: 0 auto 32px; }
input[type=text] { flex: 1; background: #1e293b; border: 1.5px solid #334155; border-radius: 10px; padding: 13px 18px; font-size: 1.1rem; color: #f1f5f9; outline: none; transition: border-color .18s; letter-spacing: .03em; }
input[type=text]:focus { border-color: #3b82f6; }
input[type=text]::placeholder { color: #475569; }
.btn-primary { background: #3b82f6; color: #fff; border: none; border-radius: 10px; padding: 13px 22px; font-size: .95rem; font-weight: 600; cursor: pointer; transition: background .18s; white-space: nowrap; }
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #334155; cursor: default; }
#resultado { max-width: 660px; margin: 0 auto; }
.card { background: #1e293b; border: 1px solid #2d3f57; border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
.card-top { display: flex; gap: 16px; padding: 20px 22px; }
.prod-img { width: 86px; height: 86px; object-fit: contain; border-radius: 8px; background: #0f172a; flex-shrink: 0; }
.prod-img-placeholder { width: 86px; height: 86px; background: #0f172a; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #334155; font-size: 2rem; }
.prod-info { flex: 1; min-width: 0; }
.prod-header { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.prod-codigo { font-size: 1.15rem; font-weight: 700; color: #f8fafc; }
.prod-marca { color: #60a5fa; font-weight: 600; }
.prod-cat { color: #94a3b8; font-size: .88rem; }
.prod-stock { margin-left: auto; font-size: .8rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
.stock-ok { background: #14532d55; color: #4ade80; border: 1px solid #166534; }
.stock-low { background: #78350f55; color: #fb923c; border: 1px solid #92400e; }
.precios { display: flex; gap: 10px; flex-wrap: wrap; }
.precio-box { background: #0f172a; border-radius: 8px; padding: 10px 14px; min-width: 130px; }
.precio-label { font-size: .7rem; color: #64748b; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
.precio-valor { font-size: 1.2rem; font-weight: 700; }
.precio-costo { color: #fb923c; }
.precio-venta { color: #4ade80; }
.precio-margen { color: #a78bfa; }
.specs-row { padding: 10px 22px 14px; border-top: 1px solid #1e3a5f; display: flex; flex-wrap: wrap; gap: 6px; }
.spec-tag { background: #0f172a; border: 1px solid #1e3a5f; border-radius: 6px; padding: 3px 10px; font-size: .78rem; color: #94a3b8; }
.apps-row { padding: 8px 22px 14px; border-top: 1px solid #1e3a5f; font-size: .82rem; color: #64748b; }
.apps-row strong { color: #94a3b8; }
.links-row { padding: 14px 22px; border-top: 1px solid #1e3a5f; display: flex; gap: 10px; flex-wrap: wrap; }
.ext-link { display: inline-flex; align-items: center; gap: 7px; border-radius: 8px; padding: 9px 16px; font-size: .88rem; font-weight: 500; text-decoration: none; cursor: pointer; transition: opacity .15s; border: none; }
.ext-link:hover { opacity: .82; }
.link-estrada { background: #1e3a5f; color: #93c5fd; }
.link-ml { background: #172033; border: 1px solid #1d4ed8; color: #93c5fd; }
.ml-compare { border-top: 1px solid #1e3a5f; padding: 16px 22px; }
.ml-compare-title { font-size: .75rem; color: #475569; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
.ml-input-row { display: flex; gap: 8px; align-items: center; }
.ml-input-row label { font-size: .88rem; color: #94a3b8; white-space: nowrap; }
input.ml-precio-inp { width: 160px; background: #0f172a; border: 1.5px solid #334155; border-radius: 8px; padding: 8px 12px; font-size: 1rem; color: #f1f5f9; outline: none; transition: border-color .18s; }
input.ml-precio-inp:focus { border-color: #3b82f6; }
input.ml-precio-inp::placeholder { color: #334155; }
.analisis { margin-top: 14px; background: #0f172a; border-radius: 10px; padding: 14px 16px; }
.analisis-row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; border-bottom: 1px solid #1e293b; font-size: .88rem; }
.analisis-row:last-child { border-bottom: none; }
.analisis-row .lbl { color: #64748b; }
.analisis-row .val { font-weight: 600; }
.val-green { color: #4ade80; } .val-yellow { color: #facc15; } .val-red { color: #f87171; } .val-blue { color: #60a5fa; } .val-purple { color: #a78bfa; }
.conclusion { margin-top: 12px; border-radius: 8px; padding: 11px 14px; font-size: .88rem; font-weight: 500; line-height: 1.4; }
.conclusion-ok { background: #14532d33; border: 1px solid #166534; color: #86efac; }
.conclusion-warn { background: #78350f33; border: 1px solid #92400e; color: #fcd34d; }
.conclusion-bad { background: #450a0a33; border: 1px solid #7f1d1d; color: #fca5a5; }
.spinner { text-align: center; color: #475569; padding: 40px; font-size: .9rem; }
.error-msg { text-align: center; color: #f87171; padding: 24px; font-size: .9rem; }
.historial-wrap { max-width: 660px; margin: 24px auto 0; }
.historial-titulo { font-size: .72rem; color: #334155; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { background: #1e293b; border: 1px solid #2d3f57; border-radius: 6px; padding: 4px 12px; font-size: .82rem; color: #64748b; cursor: pointer; transition: all .15s; }
.chip:hover { background: #263349; color: #e2e8f0; }

/* Pedido view */
.pedido-header { max-width: 1080px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #1e293b; border: 1px solid #2d3f57; border-radius: 12px; padding: 14px 20px; }
.pedido-header-info strong { font-size: 1rem; color: #f1f5f9; display: block; margin-bottom: 2px; }
.pedido-header-info span { font-size: .82rem; color: #64748b; }
.pedido-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-secondary { background: #1e293b; color: #93c5fd; border: 1.5px solid #1d4ed8; border-radius: 10px; padding: 10px 18px; font-size: .88rem; font-weight: 600; cursor: pointer; transition: all .18s; white-space: nowrap; }
.btn-secondary:hover { background: #172033; }
.btn-secondary:disabled { opacity: .4; cursor: default; }
.progress-bar-wrap { max-width: 1080px; margin: 0 auto 16px; }
.progress-bar-bg { height: 5px; background: #1e293b; border-radius: 3px; overflow: hidden; margin-bottom: 7px; }
.progress-bar-fill { height: 100%; background: #3b82f6; border-radius: 3px; transition: width .25s ease; }
.progress-text { font-size: .78rem; color: #64748b; text-align: center; }

/* Pedido table */
.pedido-table-wrap { max-width: 1080px; margin: 0 auto; overflow-x: auto; }
table.pedido-table { width: 100%; border-collapse: collapse; font-size: .83rem; }
.pedido-table th { background: #162032; color: #64748b; font-size: .68rem; text-transform: uppercase; letter-spacing: .06em; padding: 9px 10px; text-align: left; border-bottom: 1px solid #2d3f57; white-space: nowrap; }
.pedido-table th.r { text-align: right; }
.pedido-table td { padding: 8px 10px; border-bottom: 1px solid #1a2a3f; vertical-align: middle; white-space: nowrap; }
.pedido-table td.r { text-align: right; }
.pedido-table tbody tr { cursor: pointer; transition: background .12s; }
.pedido-table tbody tr:hover { background: #1a2b42; }
.pedido-table tbody tr.err-row { opacity: .45; cursor: default; }
.pedido-table tfoot td { background: #162032; border-top: 2px solid #2d3f57; border-bottom: none; font-weight: 600; padding: 11px 10px; }
.code-tag { font-family: 'Cascadia Code', 'Consolas', monospace; font-size: .85rem; color: #60a5fa; font-weight: 600; }

/* Badges */
.mg-badge { display: inline-block; padding: 2px 7px; border-radius: 5px; font-size: .78rem; font-weight: 600; }
.mg-green  { background: #14532d44; color: #4ade80; }
.mg-yellow { background: #78350f44; color: #fbbf24; }
.mg-red    { background: #450a0a44; color: #f87171; }
.sk-badge  { display: inline-block; padding: 2px 7px; border-radius: 5px; font-size: .78rem; }
.sk-ok     { background: #14532d44; color: #86efac; }
.sk-low    { background: #78350f44; color: #fb923c; }

/* ML price input in table */
.ml-tbl-inp {
  width: 120px; background: #0f172a; border: 1px solid #1e3a5f; border-radius: 6px;
  padding: 5px 8px; font-size: .82rem; color: #f1f5f9; outline: none; transition: border-color .18s;
}
.ml-tbl-inp:focus { border-color: #3b82f6; }
.ml-tbl-inp::placeholder { color: #1e3a5f; }
.ml-tbl-inp.auto-filled { border-color: #1d4ed866; }

/* ML result listing inside table */
.ml-results-cell { min-width: 220px; max-width: 300px; }
.ml-result-item { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 3px 0; border-bottom: 1px solid #1a2a3f; font-size: .78rem; }
.ml-result-item:last-child { border-bottom: none; }
.ml-result-price { font-weight: 600; color: #60a5fa; white-space: nowrap; }
.ml-result-title { color: #64748b; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }

.ml-mini { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 5px; font-size: .74rem; background: #172033; border: 1px solid #1d4ed8; color: #93c5fd; text-decoration: none; transition: opacity .15s; }
.ml-mini:hover { opacity: .8; }

/* Potencial badge */
.pot-badge { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: .78rem; font-weight: 600; }
.pot-great  { background: #14532d55; color: #4ade80; border: 1px solid #166534; }
.pot-ok     { background: #1e3a5f55; color: #93c5fd; border: 1px solid #1d4ed8; }
.pot-tight  { background: #78350f44; color: #fbbf24; border: 1px solid #92400e; }
.pot-loss   { background: #450a0a44; color: #f87171; border: 1px solid #7f1d1d; }

/* Resumen / summary */
.resumen-totales { max-width: 1080px; margin: 14px auto 0; display: flex; gap: 12px; flex-wrap: wrap; }
.res-box { flex: 1; min-width: 160px; background: #1e293b; border: 1px solid #2d3f57; border-radius: 12px; padding: 14px 18px; }
.res-box .lbl { font-size: .68rem; color: #475569; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 5px; }
.res-box .val { font-size: 1.2rem; font-weight: 700; }
.ml-dist { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.ml-dist-item { font-size: .82rem; font-weight: 600; }

/* ML note */
.ml-commission-note { font-size: .72rem; color: #334155; text-align: center; margin: 8px auto 0; max-width: 1080px; }

/* ML Simulator config bar */
.ml-config-bar { max-width: 1080px; margin: 0 auto 14px; background: #1e293b; border: 1px solid #2d3f57; border-radius: 12px; padding: 12px 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ml-config-bar .cfg-label { font-size: .7rem; color: #64748b; text-transform: uppercase; letter-spacing: .07em; white-space: nowrap; }
.ml-tipo-toggle { display: flex; gap: 3px; }
.ml-tipo-btn { background: #0f172a; border: 1.5px solid #334155; border-radius: 7px; padding: 5px 11px; font-size: .78rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all .18s; white-space: nowrap; }
.ml-tipo-btn.active-premium  { background: #172033; border-color: #2563eb; color: #93c5fd; }
.ml-tipo-btn.active-clasica  { background: #1a132e; border-color: #7c3aed; color: #c4b5fd; }
.ml-tipo-btn.active-monotrib { background: #0f2a1a; border-color: #16a34a; color: #86efac; }
.ml-tipo-btn.active-ri       { background: #1a132e; border-color: #7c3aed; color: #c4b5fd; }
.ml-tipo-btn:hover { border-color: #475569; color: #e2e8f0; }
.cfg-input-wrap { display: flex; align-items: center; gap: 5px; }
.cfg-input-wrap label { font-size: .77rem; color: #94a3b8; white-space: nowrap; }
.cfg-num-input { width: 82px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 5px 7px; font-size: .8rem; color: #f1f5f9; outline: none; transition: border-color .18s; text-align: right; }
.cfg-num-input:focus { border-color: #3b82f6; }
.cfg-select { background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 5px 7px; font-size: .8rem; color: #f1f5f9; outline: none; cursor: pointer; }
.cfg-select:focus { border-color: #3b82f6; }
/* Tooltip ML cost breakdown */
.mg-ml-wrap { position: relative; display: inline-block; cursor: help; }
.ml-tooltip { display: none; position: absolute; bottom: calc(100% + 8px); right: -8px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 12px 14px; width: 252px; z-index: 300; box-shadow: 0 8px 28px #000000aa; font-size: .79rem; line-height: 1.65; }
.ml-tooltip::after { content: ''; position: absolute; top: 100%; right: 14px; border: 6px solid transparent; border-top-color: #334155; }
.mg-ml-wrap:hover .ml-tooltip { display: block; }
.tt-row { display: flex; justify-content: space-between; gap: 10px; padding: 1px 0; }
.tt-sep { border-top: 1px solid #1e293b; margin-top: 5px; padding-top: 5px; }
.tt-lbl { color: #64748b; }
.tt-val { font-weight: 600; text-align: right; }
/* Precio mínimo column */
.precio-min-cell { font-size: .79rem; font-weight: 600; color: #a78bfa; }
.precio-min-cell.above-min { color: #4ade80; }
.precio-min-cell.below-min { color: #f87171; }
</style>
</head>
<body>

<h1>⚡ Comparador de Precios</h1>

<div class="tabs">
  <button class="tab-btn active" id="tab-buscar" onclick="switchTab('buscar')">Búsqueda</button>
  <button class="tab-btn" id="tab-pedido" onclick="switchTab('pedido')">Pedido 29/04</button>
</div>

<!-- VIEW: Búsqueda -->
<div id="view-buscar">
  <div class="search-wrap">
    <input id="inp" type="text" placeholder="Código  (ej: AB-080226)" autofocus autocomplete="off" spellcheck="false" />
    <button class="btn-primary" id="btn" onclick="buscar()">Buscar</button>
  </div>
  <div id="resultado"></div>
  <div class="historial-wrap" id="hist-wrap" style="display:none">
    <div class="historial-titulo">Recientes</div>
    <div class="chips" id="hist-lista"></div>
  </div>
</div>

<!-- VIEW: Pedido -->
<div id="view-pedido" style="display:none">

  <!-- ML Simulator config bar -->
  <div class="ml-config-bar" id="ml-config-bar" style="display:none">
    <span class="cfg-label">Publicación:</span>
    <div class="ml-tipo-toggle">
      <button class="ml-tipo-btn active-premium" id="btn-tipo-premium" onclick="setMlTipo('premium')">Premium 14%</button>
      <button class="ml-tipo-btn" id="btn-tipo-clasica" onclick="setMlTipo('clasica')">Clásica 10%</button>
    </div>
    <span class="cfg-label" style="margin-left:6px">Condición fiscal:</span>
    <div class="ml-tipo-toggle">
      <button class="ml-tipo-btn active-monotrib" id="btn-cond-monotrib" onclick="setCondFiscal('monotrib')">Monotributo</button>
      <button class="ml-tipo-btn" id="btn-cond-ri" onclick="setCondFiscal('ri')">Resp. Inscripto</button>
    </div>
    <div class="cfg-input-wrap" id="cfg-envio-wrap">
      <label>Envío est.:</label>
      <input class="cfg-num-input" id="cfg-envio" type="number" min="0" step="500" value="9000" oninput="onCfgChange()" />
    </div>
    <div class="cfg-input-wrap" id="cfg-iibb-wrap" style="display:none">
      <label>IIBB %:</label>
      <input class="cfg-num-input" id="cfg-iibb" type="number" min="0" max="10" step="0.5" value="3.5" oninput="onCfgChange()" />
    </div>
    <div class="cfg-input-wrap">
      <label>SIRTAC %:</label>
      <input class="cfg-num-input" id="cfg-sirtac" type="number" min="0" max="10" step="0.5" value="3" oninput="onCfgChange()" />
    </div>
    <div class="cfg-input-wrap">
      <label>Cuotas s/interés:</label>
      <select class="cfg-select" id="cfg-cuotas" onchange="onCfgChange()">
        <option value="0">Sin cuotas</option>
        <option value="3">3 cuotas (+8.8%)</option>
        <option value="6">6 cuotas (+12.7%)</option>
      </select>
    </div>
    <div class="cfg-input-wrap">
      <label>Margen obj.:</label>
      <input class="cfg-num-input" id="cfg-margen-min" type="number" min="0" max="200" step="5" value="30" oninput="onCfgChange()" />
      <span style="color:#64748b;font-size:.8rem">%</span>
    </div>
  </div>

  <div class="pedido-header">
    <div class="pedido-header-info">
      <strong>PEDIDO EQUIPOS ESTRADA — 29/04/26</strong>
      <span>30 artículos · Ingresá el precio ML de cada producto para ver el potencial</span>
    </div>
    <div class="pedido-header-actions">
      <button class="btn-secondary" id="btn-auto-ml" onclick="autoMlSearch()" style="display:none">🔍 Autocompletar ML</button>
      <button class="btn-primary" id="btn-pedido" onclick="analizarPedido()">Cargar precios</button>
    </div>
  </div>

  <div class="progress-bar-wrap" id="pedido-progress" style="display:none">
    <div class="progress-bar-bg"><div class="progress-bar-fill" id="prog-fill" style="width:0%"></div></div>
    <div class="progress-text" id="prog-text">0 / 30</div>
  </div>

  <div class="pedido-table-wrap" id="pedido-table-wrap" style="display:none">
    <table class="pedido-table">
      <thead>
        <tr>
          <th>#</th><th>Código</th><th>Marca / Categoría</th>
          <th class="r">Cant</th><th class="r">Costo u.</th><th class="r">Tu precio venta</th><th class="r">Mg local</th>
          <th class="r">Precio ML ↓</th><th class="r">Mg en ML</th><th class="r">Precio mín. ML</th><th class="r">Potencial</th>
          <th class="r">Stock</th><th></th>
        </tr>
      </thead>
      <tbody id="pedido-tbody"></tbody>
      <tfoot id="pedido-tfoot"></tfoot>
    </table>
  </div>
  <div class="ml-commission-note" id="ml-note" style="display:none">
    <span id="ml-note-text">* Pasá el mouse por el % de Mg en ML para ver el desglose de costos · Hacé clic en cualquier fila para ver el detalle</span>
  </div>
  <div class="resumen-totales" id="resumen-totales" style="display:none"></div>
</div>

<script>
const PEDIDO = [
  { codigo: 'AB-080226',  qty: 5  },
  { codigo: 'ANI-101960', qty: 2  },
  { codigo: 'AB-325013',  qty: 4  },
  { codigo: 'AF-0300FA',  qty: 1  },
  { codigo: 'ANI-115600', qty: 2  },
  { codigo: 'AB-555002',  qty: 2  },
  { codigo: 'AV-FG9T014', qty: 1  },
  { codigo: 'AMI-TA0592', qty: 2  },
  { codigo: 'AB-BL07YP',  qty: 1  },
  { codigo: 'ADE-595628', qty: 1  },
  { codigo: 'AB-320007',  qty: 2  },
  { codigo: 'MA-3028',    qty: 15 },
  { codigo: 'MA-4088',    qty: 2  },
  { codigo: 'MA-0029',    qty: 2  },
  { codigo: 'MA-0024',    qty: 3  },
  { codigo: 'MA-0033',    qty: 2  },
  { codigo: 'MA-4006',    qty: 4  },
  { codigo: 'MA-TSC1010', qty: 1  },
  { codigo: 'MA-0037',    qty: 2  },
  { codigo: 'MA-3024',    qty: 4  },
  { codigo: 'MA-4114',    qty: 3  },
  { codigo: 'MA-D7E15',   qty: 1  },
  { codigo: 'MA-FS10B3',  qty: 3  },
  { codigo: 'MA-C60300',  qty: 1  },
  { codigo: 'MA-0002',    qty: 3  },
  { codigo: 'MA-4067',    qty: 2  },
  { codigo: 'MA-4105',    qty: 3  },
  { codigo: 'MA-4124',    qty: 3  },
  { codigo: 'MA-TSC10R6', qty: 1  },
  { codigo: 'MA-TSC10R7', qty: 2  },
];

const ML_KEY = 'ml_prices_29_04';
const inp = document.getElementById('inp');
const btn = document.getElementById('btn');
const res = document.getElementById('resultado');
let historial = JSON.parse(localStorage.getItem('hist') || '[]');
let pedidoResults = [];
renderHist();
inp.addEventListener('keydown', e => { if (e.key === 'Enter') buscar(); });

function switchTab(tab) {
  document.getElementById('view-buscar').style.display = tab === 'buscar' ? '' : 'none';
  document.getElementById('view-pedido').style.display = tab === 'pedido' ? '' : 'none';
  document.getElementById('tab-buscar').classList.toggle('active', tab === 'buscar');
  document.getElementById('tab-pedido').classList.toggle('active', tab === 'pedido');
  if (tab === 'buscar') setTimeout(() => inp.focus(), 50);
}

// ── ML price storage ──────────────────────────────────────────────────────────

function loadMlPrices() {
  try { return JSON.parse(localStorage.getItem(ML_KEY) || '{}'); } catch { return {}; }
}

function saveMlPrice(codigo, precio) {
  const p = loadMlPrices();
  if (precio > 0) p[codigo] = precio; else delete p[codigo];
  localStorage.setItem(ML_KEY, JSON.stringify(p));
}

// ── ML Cost Simulator ─────────────────────────────────────────────────────────

function calcML(costo, precioML, cfg) {
  const { tipo, condFiscal, envio, iibb, cuotas, sirtac } = cfg;
  const comBase    = tipo === 'clasica' ? 0.10 : 0.14;
  const cuotasPct  = cuotas === '3' ? 0.088 : cuotas === '6' ? 0.127 : 0;
  const sirtacPct  = (Number(sirtac) || 0) / 100;
  // Monotributista: IVA 21% sobre comisión+cuotas es costo real (no recuperable)
  // Resp. Inscripto: IVA es crédito fiscal → no es costo; paga IIBB variable
  const descuento  = condFiscal === 'ri'
    ? comBase + (Number(iibb) || 0) / 100 + cuotasPct
    : comBase * 1.21 + cuotasPct * 1.21;
  const envioARS    = tipo === 'premium' ? (Number(envio) || 0) : 0;
  const comisionARS = precioML * comBase;
  const ivaComARS   = condFiscal === 'monotrib' ? precioML * comBase * 0.21 : 0;
  const cuotasARS   = condFiscal === 'monotrib' ? precioML * cuotasPct * 1.21 : precioML * cuotasPct;
  const iibbARS     = condFiscal === 'ri' ? precioML * (Number(iibb) || 0) / 100 : 0;
  const sirtacARS   = precioML * sirtacPct;
  const ingresoNeto = precioML * (1 - descuento) - envioARS - sirtacARS;
  const ganancia    = ingresoNeto - costo;
  return { comBase, descuento, comisionARS, ivaComARS, cuotasARS, iibbARS, sirtacARS, envioARS, ingresoNeto, ganancia, margen: ganancia / costo * 100 };
}

// Shim para analizarML() de la pestaña Búsqueda
function margenEnML(costo, precioML) {
  return calcML(costo, precioML, { tipo: 'premium', condFiscal: 'monotrib', envio: 0, iibb: 3.5, cuotas: '0' }).margen;
}

function precioMinML(costo, cfg) {
  const { tipo, condFiscal, envio, iibb, cuotas, sirtac, margenMin } = cfg;
  const comBase   = tipo === 'clasica' ? 0.10 : 0.14;
  const cuotasPct = cuotas === '3' ? 0.088 : cuotas === '6' ? 0.127 : 0;
  const sirtacPct = (Number(sirtac) || 0) / 100;
  const descuento = condFiscal === 'ri'
    ? comBase + (Number(iibb) || 0) / 100 + cuotasPct
    : comBase * 1.21 + cuotasPct * 1.21;
  const envioARS = tipo === 'premium' ? (Number(envio) || 0) : 0;
  return (costo * (1 + (Number(margenMin) || 0) / 100) + envioARS) / (1 - descuento - sirtacPct);
}

const ML_CFG_KEY = 'ml_sim_cfg';
function getMlConfig() {
  try {
    const s = JSON.parse(localStorage.getItem(ML_CFG_KEY) || '{}');
    return { tipo: s.tipo || 'premium', condFiscal: s.condFiscal || 'monotrib',
      envio: s.envio != null ? s.envio : 9000, iibb: s.iibb != null ? s.iibb : 3.5,
      sirtac: s.sirtac != null ? s.sirtac : 3,
      cuotas: s.cuotas || '0', margenMin: s.margenMin != null ? s.margenMin : 30 };
  } catch { return { tipo: 'premium', condFiscal: 'monotrib', envio: 9000, iibb: 3.5, cuotas: '0', margenMin: 30 }; }
}

function saveMlConfig(cfg) { try { localStorage.setItem(ML_CFG_KEY, JSON.stringify(cfg)); } catch {} }

function setMlTipo(tipo) {
  const cfg = getMlConfig(); cfg.tipo = tipo; saveMlConfig(cfg);
  document.getElementById('btn-tipo-premium').className = 'ml-tipo-btn' + (tipo === 'premium' ? ' active-premium' : '');
  document.getElementById('btn-tipo-clasica').className = 'ml-tipo-btn' + (tipo === 'clasica'  ? ' active-clasica'  : '');
  const envWrap = document.getElementById('cfg-envio-wrap');
  if (envWrap) envWrap.style.opacity = tipo === 'clasica' ? '0.35' : '1';
  rerenderMlCells();
}

function setCondFiscal(cond) {
  const cfg = getMlConfig(); cfg.condFiscal = cond; saveMlConfig(cfg);
  document.getElementById('btn-cond-monotrib').className = 'ml-tipo-btn' + (cond === 'monotrib' ? ' active-monotrib' : '');
  document.getElementById('btn-cond-ri').className       = 'ml-tipo-btn' + (cond === 'ri'       ? ' active-ri'       : '');
  const iibbWrap = document.getElementById('cfg-iibb-wrap');
  if (iibbWrap) iibbWrap.style.display = cond === 'ri' ? '' : 'none';
  rerenderMlCells();
}

function onCfgChange() {
  const cfg = getMlConfig();
  const envEl    = document.getElementById('cfg-envio');
  const iibbEl   = document.getElementById('cfg-iibb');
  const sirtacEl = document.getElementById('cfg-sirtac');
  const cuotEl   = document.getElementById('cfg-cuotas');
  const mgEl     = document.getElementById('cfg-margen-min');
  if (envEl)    cfg.envio     = Number(envEl.value)    || 0;
  if (iibbEl)   cfg.iibb      = Number(iibbEl.value)   || 0;
  if (sirtacEl) cfg.sirtac    = Number(sirtacEl.value) || 0;
  if (cuotEl)   cfg.cuotas    = cuotEl.value;
  if (mgEl)     cfg.margenMin = Number(mgEl.value)     || 0;
  saveMlConfig(cfg);
  rerenderMlCells();
}

function parsePrecio(s) {
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function renderMgBadge(margen, prefix) {
  const cls = margen >= 60 ? 'mg-green' : margen >= 40 ? 'mg-yellow' : 'mg-red';
  return \`<span class="mg-badge \${cls}">\${prefix || ''}\${Math.round(margen)}%</span>\`;
}

function renderPotencial(margenML) {
  if (margenML >= 35) return \`<span class="pot-badge pot-great">Excelente</span>\`;
  if (margenML >= 20) return \`<span class="pot-badge pot-ok">Bueno</span>\`;
  if (margenML >= 8)  return \`<span class="pot-badge pot-tight">Ajustado</span>\`;
  return \`<span class="pot-badge pot-loss">Sin margen</span>\`;
}

function renderMlTooltip(costo, precioML, cfg) {
  const { comBase, comisionARS, ivaComARS, cuotasARS, iibbARS, sirtacARS, envioARS, ingresoNeto, ganancia, margen } = calcML(costo, precioML, cfg);
  const mgCls    = margen >= 20 ? 'val-green' : margen >= 8 ? 'val-yellow' : 'val-red';
  const ivaRow   = ivaComARS > 0  ? \`<div class="tt-row"><span class="tt-lbl">IVA s/comisión (21%)</span><span class="tt-val" style="color:#f87171">−\${fmt(ivaComARS)}</span></div>\` : '';
  const cuotRow  = cuotasARS > 0  ? \`<div class="tt-row"><span class="tt-lbl">Cargo cuotas</span><span class="tt-val" style="color:#f87171">−\${fmt(cuotasARS)}</span></div>\` : '';
  const iibbRow  = iibbARS > 0    ? \`<div class="tt-row"><span class="tt-lbl">IIBB</span><span class="tt-val" style="color:#f87171">−\${fmt(iibbARS)}</span></div>\` : '';
  const sirtacRow = sirtacARS > 0 ? \`<div class="tt-row"><span class="tt-lbl">SIRTAC (\${cfg.sirtac}%)</span><span class="tt-val" style="color:#f87171">−\${fmt(sirtacARS)}</span></div>\` : '';
  const envRow   = envioARS > 0
    ? \`<div class="tt-row"><span class="tt-lbl">Envío (vendedor)</span><span class="tt-val" style="color:#f87171">−\${fmt(envioARS)}</span></div>\`
    : \`<div class="tt-row"><span class="tt-lbl">Envío</span><span class="tt-val" style="color:#475569">comprador paga</span></div>\`;
  return \`<div class="ml-tooltip">
    <div class="tt-row"><span class="tt-lbl">Precio publicado</span><span class="tt-val val-blue">\${fmt(precioML)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Comisión (\${Math.round(comBase*100)}%)</span><span class="tt-val" style="color:#f87171">−\${fmt(comisionARS)}</span></div>
    \${ivaRow}\${cuotRow}\${iibbRow}\${sirtacRow}\${envRow}
    <div class="tt-row tt-sep"><span class="tt-lbl">Ingreso neto</span><span class="tt-val val-blue">\${fmt(ingresoNeto)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Costo Electroestrada</span><span class="tt-val precio-costo">−\${fmt(costo)}</span></div>
    <div class="tt-row tt-sep"><span class="tt-lbl">Ganancia</span><span class="tt-val \${ganancia >= 0 ? 'val-green' : 'val-red'}">\${fmt(ganancia)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Margen sobre costo</span><span class="tt-val \${mgCls}">\${margen.toFixed(1)}%</span></div>
  </div>\`;
}

function renderPrecioMinCell(costo, mlPrecio, cfg) {
  const minP = precioMinML(costo, cfg);
  let cls = 'precio-min-cell';
  if (mlPrecio > 0) cls += mlPrecio >= minP ? ' above-min' : ' below-min';
  return \`<span class="\${cls}" title="Precio mínimo para \${cfg.margenMin}% de margen">\${fmt(minP)}</span>\`;
}

// ── Search (Búsqueda tab) ─────────────────────────────────────────────────────

async function buscar() {
  const codigo = inp.value.trim().toUpperCase();
  if (!codigo) return;
  btn.disabled = true;
  res.innerHTML = '<div class="spinner">Consultando Electroestrada...</div>';
  try {
    const r = await fetch('/api/buscar?codigo=' + encodeURIComponent(codigo));
    const p = await r.json();
    if (p.error) { res.innerHTML = '<div class="error-msg">❌ ' + p.error + '</div>'; return; }
    agregarHist(codigo);
    const margen = Math.round((p.precio_venta - p.precio) / p.precio * 100);
    const stockMeses = p.meses_stock;
    const stockCls = p.stock > 10 ? 'stock-ok' : 'stock-low';
    const specsHtml = (p.atributos || []).filter(a => a.visible)
      .map(a => \`<span class="spec-tag">\${a.titulo}: \${a.medida}</span>\`).join('');
    const apps = (p.aplicaciones || []).slice(0, 6)
      .map(a => \`\${a.nombre_marca} \${a.modelo}\${a.detalle ? ' ' + a.detalle : ''}\`).join(' · ');
    res.innerHTML = \`
      <div class="card">
        <div class="card-top">
          \${p.thumb
            ? \`<img class="prod-img" src="https://www.electroestrada.com.ar/\${p.thumb}" onerror="this.style.display='none'" />\`
            : \`<div class="prod-img-placeholder">📦</div>\`}
          <div class="prod-info">
            <div class="prod-header">
              <span class="prod-codigo">\${p.codigo}</span>
              <span class="prod-marca">\${p.nombre_marca}</span>
              <span class="prod-cat">\${p.nombre_cat}</span>
              <span class="prod-stock \${stockCls}">📦 \${p.stock} u.</span>
            </div>
            <div class="precios">
              <div class="precio-box"><div class="precio-label">Costo lista</div><div class="precio-valor precio-costo">\${p.precio_fmt}</div></div>
              <div class="precio-box"><div class="precio-label">Precio de venta</div><div class="precio-valor precio-venta">\${p.precio_venta_fmt}</div></div>
              <div class="precio-box"><div class="precio-label">Tu margen</div><div class="precio-valor precio-margen">\${margen}%</div></div>
            </div>
          </div>
        </div>
        \${specsHtml ? \`<div class="specs-row">\${specsHtml}</div>\` : ''}
        \${apps ? \`<div class="apps-row"><strong>Aplica a:</strong> \${apps}</div>\` : ''}
        <div class="links-row">
          <a class="ext-link link-estrada" href="\${p.estradaUrl}" target="_blank">🏭 Ver en Electroestrada</a>
          <a class="ext-link link-ml" href="\${p.mlUrl}" target="_blank">🛒 Ver en MercadoLibre</a>
        </div>
        <div class="ml-compare">
          <div class="ml-compare-title">Análisis vs MercadoLibre</div>
          <div class="ml-input-row">
            <label>Precio ML (el más barato que ves):</label>
            <input class="ml-precio-inp" id="ml-inp" type="text" placeholder="ej: 280000"
              oninput="analizarML(\${p.precio}, \${p.precio_venta}, \${margen}, \${stockMeses}, \${p.stock})" />
          </div>
          <div id="analisis-panel"></div>
        </div>
      </div>\`;
    document.getElementById('ml-inp')?.focus();
  } catch(e) {
    res.innerHTML = '<div class="error-msg">❌ Error: ' + e.message + '</div>';
  } finally { btn.disabled = false; }
}

function analizarML(costo, ventaEstrada, margenEstrada, mesesStock, stock) {
  const precioML = parsePrecio(document.getElementById('ml-inp')?.value || '');
  const panel = document.getElementById('analisis-panel');
  if (!panel) return;
  if (!precioML || precioML < 100) { panel.innerHTML = ''; return; }
  const diffPct = (ventaEstrada - precioML) / precioML * 100;
  const margenML = margenEnML(costo, precioML);
  let diffCls = diffPct > 10 ? 'val-red' : diffPct > 0 ? 'val-yellow' : 'val-green';
  let conclusionCls, conclusionTxt;
  if (diffPct > 15) { conclusionCls = 'conclusion-bad'; conclusionTxt = '⚠️ Tu precio supera bastante al más barato en ML. Revisá si podés ajustar o si el diferencial de calidad/garantía lo justifica.'; }
  else if (diffPct > 0) { conclusionCls = 'conclusion-warn'; conclusionTxt = '🔶 Estás un poco más caro que ML. Con servicio al cliente y garantía podés sostener el precio.'; }
  else { conclusionCls = 'conclusion-ok'; conclusionTxt = '✅ Tu precio es competitivo frente a ML. Tenés margen para mantenerlo o subirlo levemente.'; }
  panel.innerHTML = \`
    <div class="analisis">
      <div class="analisis-row"><span class="lbl">Tu precio de venta</span><span class="val val-green">\${fmt(ventaEstrada)}</span></div>
      <div class="analisis-row"><span class="lbl">Precio ML (ingresado)</span><span class="val val-blue">\${fmt(precioML)}</span></div>
      <div class="analisis-row"><span class="lbl">Diferencia</span><span class="val \${diffCls}">\${diffPct >= 0 ? '+' : ''}\${diffPct.toFixed(1)}%</span></div>
      <div class="analisis-row"><span class="lbl">Tu margen sobre costo</span><span class="val val-purple">\${margenEstrada}%</span></div>
      <div class="analisis-row"><span class="lbl">Margen vendiendo en ML (−13% comisión)</span><span class="val \${margenML > 30 ? 'val-green' : margenML > 0 ? 'val-yellow' : 'val-red'}">\${margenML.toFixed(1)}%</span></div>
      <div class="analisis-row"><span class="lbl">Stock disponible</span><span class="val val-blue">\${stock} u. · \${mesesStock} mes\${mesesStock !== 1 ? 'es' : ''}</span></div>
    </div>
    <div class="conclusion \${conclusionCls}">\${conclusionTxt}</div>\`;
}

// ── Pedido tab ────────────────────────────────────────────────────────────────

async function analizarPedido() {
  const btnP = document.getElementById('btn-pedido');
  btnP.disabled = true; btnP.textContent = 'Cargando...';
  const progWrap = document.getElementById('pedido-progress');
  const fill = document.getElementById('prog-fill');
  const progText = document.getElementById('prog-text');
  progWrap.style.display = '';
  fill.style.width = '0%';

  const results = new Array(PEDIDO.length);
  let done = 0;
  const tick = () => {
    done++;
    fill.style.width = Math.round(done / PEDIDO.length * 100) + '%';
    progText.textContent = done + ' / ' + PEDIDO.length + ' consultados...';
  };

  for (let i = 0; i < PEDIDO.length; i += 3) {
    const batch = PEDIDO.slice(i, i + 3);
    await Promise.all(batch.map((item, j) =>
      fetch('/api/buscar?codigo=' + encodeURIComponent(item.codigo))
        .then(r => r.json())
        .then(p => { results[i + j] = { ...item, prod: p.error ? null : p, err: p.error || null }; tick(); })
        .catch(e => { results[i + j] = { ...item, prod: null, err: e.message }; tick(); })
    ));
  }

  progWrap.style.display = 'none';
  pedidoResults = results;
  // Sync ML prices from server before rendering
  await syncPricesFromServer();
  renderPedido(results);
  document.getElementById('btn-auto-ml').style.display = '';
  btnP.disabled = false; btnP.textContent = 'Actualizar';
}

// Auto-search ML prices for all products
async function autoMlSearch() {
  const btnA = document.getElementById('btn-auto-ml');
  btnA.disabled = true; btnA.textContent = '🔍 Buscando...';
  const progWrap = document.getElementById('pedido-progress');
  const fill = document.getElementById('prog-fill');
  const progText = document.getElementById('prog-text');
  progWrap.style.display = '';
  fill.style.width = '0%';

  const withProds = pedidoResults.filter(r => r.prod);
  let done = 0, found = 0;

  for (let i = 0; i < withProds.length; i += 3) {
    const batch = withProds.slice(i, i + 3);
    await Promise.all(batch.map(async item => {
      const { codigo, prod } = item;
      const queries = [codigo, prod.nombre_marca + ' ' + prod.nombre_cat];
      let gotPrice = false;
      for (const q of queries) {
        try {
          const r = await fetch('/api/ml-buscar?q=' + encodeURIComponent(q));
          const data = await r.json();
          if (data.ok && data.results && data.results.length > 0) {
            const precio = data.results[0].precio;
            saveMlPrice(codigo, precio);
            fetch('/api/ml-precios', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ codigo, precio }) }).catch(() => {});
            const inp2 = document.querySelector('.ml-tbl-inp[data-codigo="' + codigo + '"]');
            if (inp2) { inp2.value = Math.round(precio).toLocaleString('es-AR'); inp2.classList.add('auto-filled'); }
            const cfg2 = getMlConfig();
            const ac = calcML(prod.precio, precio, cfg2);
            const cell = document.getElementById('mg-ml-' + codigo);
            if (cell) cell.innerHTML = \`<span class="mg-ml-wrap">\${renderMgBadge(ac.margen, '')}\${renderMlTooltip(prod.precio, precio, cfg2)}</span>\`;
            const pminCell = document.getElementById('pmin-' + codigo);
            if (pminCell) pminCell.innerHTML = renderPrecioMinCell(prod.precio, precio, cfg2);
            const pot = document.getElementById('pot-' + codigo);
            if (pot) pot.innerHTML = renderPotencial(ac.margen);
            found++;
            gotPrice = true;
            break;
          }
        } catch {}
      }
      done++;
      fill.style.width = Math.round(done / withProds.length * 100) + '%';
      progText.textContent = done + ' / ' + withProds.length + ' buscados en ML... ' + found + ' encontrados';
    }));
  }

  progWrap.style.display = 'none';
  updateResumen();
  btnA.disabled = false;
  btnA.textContent = found > 0 ? \`🔍 Autocompletar ML (\${found} encontrados)\` : '🔍 Autocompletar ML (sin resultados — ingresá manualmente)';
}

async function syncPricesFromServer() {
  try {
    const r = await fetch('/api/ml-precios');
    const serverPrices = await r.json();
    const local = loadMlPrices();
    const merged = Object.assign({}, local, serverPrices);
    localStorage.setItem(ML_KEY, JSON.stringify(merged));
    return merged;
  } catch { return loadMlPrices(); }
}

function onMlInput(inputEl) {
  event.stopPropagation();
  const codigo = inputEl.dataset.codigo;
  const val = parsePrecio(inputEl.value);
  saveMlPrice(codigo, val);
  if (val > 0) fetch('/api/ml-precios', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ codigo, precio: val }) }).catch(() => {});
  const item = pedidoResults.find(r => r.codigo === codigo);
  if (!item || !item.prod) return;
  const cfg = getMlConfig();
  const mlCalc = val > 0 ? calcML(item.prod.precio, val, cfg) : null;
  const cell = document.getElementById('mg-ml-' + codigo);
  if (cell) cell.innerHTML = mlCalc !== null
    ? \`<span class="mg-ml-wrap">\${renderMgBadge(mlCalc.margen, '')}\${renderMlTooltip(item.prod.precio, val, cfg)}</span>\`
    : '<span style="color:#334155">—</span>';
  const pminCell = document.getElementById('pmin-' + codigo);
  if (pminCell) pminCell.innerHTML = renderPrecioMinCell(item.prod.precio, val > 0 ? val : 0, cfg);
  const pot = document.getElementById('pot-' + codigo);
  if (pot) pot.innerHTML = mlCalc !== null ? renderPotencial(mlCalc.margen) : '<span style="color:#334155">—</span>';
  updateResumen();
}

function verProducto(codigo) {
  switchTab('buscar');
  inp.value = codigo;
  buscar();
}

function renderPedido(results) {
  const tableWrap = document.getElementById('pedido-table-wrap');
  const tbody = document.getElementById('pedido-tbody');
  const tfoot = document.getElementById('pedido-tfoot');
  tableWrap.style.display = '';
  document.getElementById('ml-note').style.display = '';
  document.getElementById('ml-config-bar').style.display = '';

  const cfg      = getMlConfig();
  const mlPrices = loadMlPrices();
  let totalCosto = 0, totalVenta = 0, rows = '';

  results.forEach((item, idx) => {
    const { codigo, qty, prod, err } = item;
    if (!prod) {
      rows += \`<tr class="err-row"><td>\${idx+1}</td><td><span class="code-tag">\${codigo}</span></td>
        <td colspan="10" style="color:#f87171">No encontrado en Electroestrada</td><td></td></tr>\`;
      return;
    }
    const mgLocal  = Math.round((prod.precio_venta - prod.precio) / prod.precio * 100);
    const skCls    = prod.stock > qty * 2 ? 'sk-ok' : 'sk-low';
    const mlPrecio = mlPrices[codigo] || 0;
    const mlCalc   = mlPrecio > 0 ? calcML(prod.precio, mlPrecio, cfg) : null;
    const mgML     = mlCalc ? mlCalc.margen : null;
    const mgMLHtml = mlCalc !== null
      ? \`<span class="mg-ml-wrap">\${renderMgBadge(mgML, '')}\${renderMlTooltip(prod.precio, mlPrecio, cfg)}</span>\`
      : '<span style="color:#334155">—</span>';
    const pminHtml = renderPrecioMinCell(prod.precio, mlPrecio, cfg);
    const potHtml  = mgML !== null ? renderPotencial(mgML) : '<span style="color:#334155">—</span>';
    const mlInpVal = mlPrecio > 0 ? Math.round(mlPrecio).toLocaleString('es-AR') : '';
    totalCosto += qty * prod.precio;
    totalVenta += qty * prod.precio_venta;

    rows += \`<tr onclick="verProducto('\${codigo}')">
      <td style="color:#475569">\${idx+1}</td>
      <td><span class="code-tag">\${codigo}</span></td>
      <td><span style="color:#93c5fd">\${prod.nombre_marca}</span> <span style="color:#475569;font-size:.78rem">\${prod.nombre_cat}</span></td>
      <td class="r" style="font-weight:600">\${qty}</td>
      <td class="r precio-costo">\${prod.precio_fmt}</td>
      <td class="r precio-venta">\${prod.precio_venta_fmt}</td>
      <td class="r">\${renderMgBadge(mgLocal, '')}</td>
      <td class="r"><input class="ml-tbl-inp" data-codigo="\${codigo}" value="\${mlInpVal}"
        placeholder="ingresá" oninput="onMlInput(this)" onclick="event.stopPropagation()" /></td>
      <td class="r" id="mg-ml-\${codigo}">\${mgMLHtml}</td>
      <td class="r" id="pmin-\${codigo}">\${pminHtml}</td>
      <td class="r" id="pot-\${codigo}">\${potHtml}</td>
      <td class="r"><span class="sk-badge \${skCls}">\${prod.stock.toLocaleString('es-AR')}</span></td>
      <td><a class="ml-mini" href="\${prod.mlUrl}" target="_blank" onclick="event.stopPropagation()">ML ↗</a></td>
    </tr>\`;
  });

  tbody.innerHTML = rows;
  const ganancia = totalVenta - totalCosto;
  const mgTotalPct = totalCosto > 0 ? Math.round(ganancia / totalCosto * 100) : 0;
  tfoot.innerHTML = \`<tr>
    <td colspan="4" style="color:#64748b">TOTALES DEL PEDIDO</td>
    <td class="r precio-costo">\${fmt(totalCosto)}</td>
    <td class="r precio-venta">\${fmt(totalVenta)}</td>
    <td class="r" style="color:#a78bfa">\${mgTotalPct}%</td>
    <td colspan="6"></td>
  </tr>\`;

  // Restore config values into inputs
  const envEl    = document.getElementById('cfg-envio');
  const iibbEl   = document.getElementById('cfg-iibb');
  const sirtacEl = document.getElementById('cfg-sirtac');
  const cuotEl   = document.getElementById('cfg-cuotas');
  const mgEl     = document.getElementById('cfg-margen-min');
  if (envEl)    envEl.value    = cfg.envio;
  if (iibbEl)   iibbEl.value   = cfg.iibb;
  if (sirtacEl) sirtacEl.value = cfg.sirtac ?? 3;
  if (cuotEl)   cuotEl.value   = cfg.cuotas;
  if (mgEl)     mgEl.value     = cfg.margenMin;
  setMlTipo(cfg.tipo);
  setCondFiscal(cfg.condFiscal);

  updateResumen();
}

function rerenderMlCells() {
  if (!pedidoResults.length) return;
  const cfg      = getMlConfig();
  const mlPrices = loadMlPrices();
  pedidoResults.forEach(item => {
    if (!item.prod) return;
    const { codigo, prod } = item;
    const mlPrecio = mlPrices[codigo] || 0;
    const mlCalc   = mlPrecio > 0 ? calcML(prod.precio, mlPrecio, cfg) : null;
    const mgML     = mlCalc ? mlCalc.margen : null;
    const cell = document.getElementById('mg-ml-' + codigo);
    if (cell) cell.innerHTML = mlCalc !== null
      ? \`<span class="mg-ml-wrap">\${renderMgBadge(mgML, '')}\${renderMlTooltip(prod.precio, mlPrecio, cfg)}</span>\`
      : '<span style="color:#334155">—</span>';
    const pminCell = document.getElementById('pmin-' + codigo);
    if (pminCell) pminCell.innerHTML = renderPrecioMinCell(prod.precio, mlPrecio, cfg);
    const pot = document.getElementById('pot-' + codigo);
    if (pot) pot.innerHTML = mgML !== null ? renderPotencial(mgML) : '<span style="color:#334155">—</span>';
  });
  updateResumen();
}

function updateResumen() {
  const resumenWrap = document.getElementById('resumen-totales');
  if (!resumenWrap || !pedidoResults.length) return;
  resumenWrap.style.display = 'flex';

  const cfg      = getMlConfig();
  const mlPrices = loadMlPrices();
  let totalCosto = 0, totalVenta = 0;
  let excelente = 0, bueno = 0, ajustado = 0, sinMargen = 0, sinPrecio = 0;

  pedidoResults.forEach(item => {
    if (!item.prod) return;
    const { qty, prod } = item;
    totalCosto += qty * prod.precio;
    totalVenta += qty * prod.precio_venta;
    const ml = mlPrices[item.codigo];
    if (!ml) { sinPrecio++; return; }
    const mg = calcML(prod.precio, ml, cfg).margen;
    if (mg >= 35) excelente++;
    else if (mg >= 20) bueno++;
    else if (mg >= 8) ajustado++;
    else sinMargen++;
  });

  const ganancia = totalVenta - totalCosto;
  const mgPct = totalCosto > 0 ? Math.round(ganancia / totalCosto * 100) : 0;
  const analizados = pedidoResults.filter(r => r.prod).length - sinPrecio;
  const total = pedidoResults.filter(r => r.prod).length;
  const cfgLabel = cfg.condFiscal === 'ri'
    ? \`RI · \${cfg.tipo === 'clasica' ? 'Clásica 10%' : 'Premium 14%'} + IIBB \${cfg.iibb}%\`
    : \`Monotributo · \${cfg.tipo === 'clasica' ? 'Clásica (efect. 12.1%)' : 'Premium (efect. 16.94%)'}\`;

  resumenWrap.innerHTML = \`
    <div class="res-box">
      <div class="lbl">Total invertido (costo)</div>
      <div class="val precio-costo">\${fmt(totalCosto)}</div>
    </div>
    <div class="res-box">
      <div class="lbl">Total a facturar (local)</div>
      <div class="val precio-venta">\${fmt(totalVenta)}</div>
      <div style="font-size:.78rem;color:#a78bfa;margin-top:3px">Ganancia \${fmt(ganancia)} · margen \${mgPct}%</div>
    </div>
    <div class="res-box">
      <div class="lbl">Potencial ML · \${cfgLabel} (\${analizados}/\${total})</div>
      \${analizados > 0
        ? \`<div class="ml-dist">
            \${excelente > 0 ? \`<span class="ml-dist-item" style="color:#4ade80">\${excelente} excelentes</span>\` : ''}
            \${bueno > 0     ? \`<span class="ml-dist-item" style="color:#93c5fd">\${bueno} buenos</span>\` : ''}
            \${ajustado > 0  ? \`<span class="ml-dist-item" style="color:#fbbf24">\${ajustado} ajustados</span>\` : ''}
            \${sinMargen > 0 ? \`<span class="ml-dist-item" style="color:#f87171">\${sinMargen} sin margen</span>\` : ''}
          </div>\`
        : \`<div style="font-size:.82rem;color:#475569;margin-top:6px">Ingresá precios ML para ver el análisis</div>\`
      }
    </div>\`;
}

function agregarHist(c) {
  historial = [c, ...historial.filter(x => x !== c)].slice(0, 12);
  localStorage.setItem('hist', JSON.stringify(historial));
  renderHist();
}

function renderHist() {
  const wrap = document.getElementById('hist-wrap');
  const lista = document.getElementById('hist-lista');
  if (!historial.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  lista.innerHTML = historial.map(c =>
    \`<span class="chip" onclick="inp.value='\${c}';buscar()">\${c}</span>\`).join('');
}
</script>
</body>
</html>`;

// ── Servidor ──────────────────────────────────────────────────────────────────

let config;
try {
  config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
} catch {
  console.error('❌  No se encontró comparar.config.json');
  process.exit(1);
}

const hasMlAuth = !!(config.ml_client_id && config.ml_client_secret && !config.ml_client_id.startsWith('OPCIONAL'));

const server = http.createServer(async (req, res) => {
  // CORS — needed for cross-origin fetch from mercadolibre.com.ar tab
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  if (url.pathname === '/api/buscar') {
    const codigo = (url.searchParams.get('codigo') || '').trim().toUpperCase();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!codigo) { res.writeHead(400); res.end(JSON.stringify({ error: 'Falta el código' })); return; }
    try {
      const prod = await getEstradaProduct(codigo, config);
      if (!prod) { res.writeHead(404); res.end(JSON.stringify({ error: `Código ${codigo} no encontrado en Electroestrada` })); return; }
      res.writeHead(200);
      res.end(JSON.stringify(productToJson(prod)));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (url.pathname === '/api/ml-buscar') {
    const q = (url.searchParams.get('q') || '').trim();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!q) { res.writeHead(400); res.end(JSON.stringify({ error: 'falta q' })); return; }
    if (!hasMlAuth) { res.writeHead(200); res.end(JSON.stringify({ ok: false, noAuth: true })); return; }
    try {
      const token = await getMlToken(config.ml_client_id, config.ml_client_secret);
      const result = await searchML(q, token);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (e) {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  if (url.pathname === '/api/ml-precios' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.end(JSON.stringify(loadMlPrecios()));
    return;
  }

  if (url.pathname === '/api/ml-precios' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      try {
        const { codigo, precio } = JSON.parse(body);
        if (!codigo) { res.writeHead(400); res.end(JSON.stringify({ error: 'falta codigo' })); return; }
        const updated = saveMlPrecio(String(codigo).toUpperCase(), Number(precio) || 0);
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, total: Object.keys(updated).length }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n✅  Comparador corriendo en ${url}\n`);
  exec(`start "" "${url}"`);
});
