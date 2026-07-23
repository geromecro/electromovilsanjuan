#!/usr/bin/env node
// comparar.mjs — Comparador de precios: Electroestrada vs MercadoLibre
// Uso:    node comparar.mjs AB-080226
//         node comparar.mjs AB-080226 AB-080227 AB-080228
// Config: ver comparar.config.json

import https from 'https';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __dir = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(__dir, 'comparar.config.json');
const TOKEN_CACHE  = join(__dir, '.ml_token_cache.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPesos(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function httpRequest(hostname, path, method = 'GET', body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json',
      ...extraHeaders,
    };
    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
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
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(encoded),
        'Accept': 'application/json',
      }
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
  if (idx < 0) throw new Error('Respuesta inesperada del servidor');
  return JSON.parse(text.slice(idx));
}

// ── Electroestrada ────────────────────────────────────────────────────────────

async function loginEstrada(email, password) {
  const payload = JSON.stringify({ email, pass: password });
  const res = await httpRequest('www.electroestrada.com.ar', '/api/login', 'POST', payload);
  const cookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

  let data;
  try { data = parseJson(res.body); } catch {
    throw new Error(`Login fallido (HTTP ${res.status}). Verificá el email y password en comparar.config.json`);
  }
  if (data.success === false) {
    throw new Error(`Credenciales Electroestrada incorrectas: ${data.msg || ''}`);
  }
  if (!data.id && !cookies.includes('PHPSESSID')) {
    throw new Error('El login no retornó una sesión válida.');
  }
  return cookies;
}

async function getEstradaProduct(codigo, cookies) {
  const payload = JSON.stringify({ search_q: codigo });
  const res = await httpRequest('www.electroestrada.com.ar', '/api/producto', 'POST', payload, { Cookie: cookies });
  let data;
  try { data = parseJson(res.body); } catch { return null; }
  return data.listado?.[0] ?? null;
}

// ── MercadoLibre OAuth ────────────────────────────────────────────────────────

function loadCachedToken() {
  if (!existsSync(TOKEN_CACHE)) return null;
  try {
    const c = JSON.parse(readFileSync(TOKEN_CACHE, 'utf8'));
    if (c.expires_at && Date.now() < c.expires_at - 60_000) return c.access_token;
  } catch {}
  return null;
}

function saveToken(token, expiresIn) {
  try {
    writeFileSync(TOKEN_CACHE, JSON.stringify({
      access_token: token,
      expires_at: Date.now() + expiresIn * 1000,
    }));
  } catch {}
}

async function getMlToken(clientId, clientSecret) {
  const cached = loadCachedToken();
  if (cached) return cached;

  const res = await httpForm('api.mercadolibre.com', '/oauth/token', {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  let data;
  try { data = JSON.parse(res.body); } catch {
    throw new Error('ML OAuth: respuesta inválida');
  }
  if (!data.access_token) {
    throw new Error(`ML OAuth falló: ${data.message || data.error || JSON.stringify(data)}`);
  }
  saveToken(data.access_token, data.expires_in || 21600);
  return data.access_token;
}

async function searchML(query, mlToken) {
  const path = `/sites/MLA/search?q=${encodeURIComponent(query)}&limit=10&sort=relevance&status=active`;
  const res = await httpRequest('api.mercadolibre.com', path, 'GET', null, {
    'Authorization': `Bearer ${mlToken}`,
  });
  if (res.status !== 200) return [];
  let data;
  try { data = JSON.parse(res.body); } catch { return []; }
  return (data.results || [])
    .filter(r => r.condition === 'new')
    .slice(0, 6)
    .map(r => ({
      titulo: r.title,
      precio: r.price,
      vendedor: r.seller?.nickname ?? '?',
      ventas: r.sold_quantity ?? 0,
      url: r.permalink,
    }))
    .sort((a, b) => a.precio - b.precio);
}

async function getMercadoLibrePrices(prod, mlToken) {
  if (!mlToken) return { results: [], noAuth: true, queryUsed: null };

  // Estrategia 1: código exacto
  let results = await searchML(prod.codigo, mlToken);
  if (results.length) return { results, noAuth: false, queryUsed: prod.codigo };

  // Estrategia 2: marca + código (algunos vendedores ponen ambos en el título)
  const q2 = `${prod.nombre_marca} ${prod.codigo}`;
  results = await searchML(q2, mlToken);
  if (results.length) return { results, noAuth: false, queryUsed: q2 };

  // Estrategia 3: marca + categoría (rango de mercado general)
  const q3 = `${prod.nombre_marca} ${prod.nombre_cat}`;
  results = await searchML(q3, mlToken);
  return { results, noAuth: false, queryUsed: results.length ? q3 : null };
}

// ── Display ───────────────────────────────────────────────────────────────────

function printComparison(prod, mlData) {
  const precioVenta = prod.precio_markup1;
  const W = 68;

  console.log('\n' + '═'.repeat(W));
  console.log(` ${prod.codigo}  |  ${prod.nombre_marca}  |  ${prod.nombre_cat}  |  Stock: ${prod.stock} u.`);
  console.log('═'.repeat(W));

  console.log('\n  ELECTROESTRADA (tu costo de compra)');
  console.log(`    Costo lista  :  ${formatPesos(prod.precio)}`);
  console.log(`    Precio venta :  ${formatPesos(precioVenta)}`);
  if (prod.precio_markup2 && prod.precio_markup2 !== precioVenta) {
    console.log(`    Precio venta2:  ${formatPesos(prod.precio_markup2)}`);
  }

  const mlUrl = `https://listado.mercadolibre.com.ar/${prod.codigo.toLowerCase()}`;

  if (mlData.noAuth) {
    console.log('\n  MERCADO LIBRE');
    console.log('  ⚠️  Para ver precios de ML configurá ml_client_id y ml_client_secret en comparar.config.json');
    console.log(`  🔗  ${mlUrl}`);
    return;
  }

  if (!mlData.results.length) {
    const searchQuery = `${prod.nombre_marca} ${prod.nombre_cat} ${prod.codigo}`;
    const searchUrl = `https://listado.mercadolibre.com.ar/${encodeURIComponent(searchQuery.toLowerCase().replace(/ /g, '-'))}`;
    console.log(`\n  MERCADO LIBRE  →  Abriendo búsqueda en el browser...`);
    console.log(`  🔗  ${searchUrl}`);
    exec(`start "" "${searchUrl}"`);
    return;
  }

  const sorted = mlData.results;
  const queryLabel = mlData.queryUsed === prod.codigo
    ? 'nuevos, ordenados por precio'
    : `búsqueda: "${mlData.queryUsed}" — puede incluir variantes`;
  console.log(`\n  MERCADO LIBRE (${queryLabel})`);
  console.log('  ' + '─'.repeat(W - 2));
  console.log(`  ${'Precio ML'.padEnd(14)} ${'vs tu venta'.padEnd(13)} ${'Vendidos'.padEnd(9)} Publicación`);
  console.log('  ' + '─'.repeat(W - 2));

  sorted.forEach(r => {
    const diff = ((r.precio - precioVenta) / precioVenta * 100);
    const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
    const ventasStr = r.ventas > 0 ? String(r.ventas) : '—';
    const titulo = r.titulo.length > 33 ? r.titulo.slice(0, 30) + '...' : r.titulo;
    const alerta = diff < 0 ? ' ⚠' : '';
    console.log(`  ${formatPesos(r.precio).padEnd(14)} ${(diffStr + alerta).padEnd(13)} ${ventasStr.padEnd(9)} ${titulo}`);
  });

  const minML = sorted[0].precio;
  const maxML = sorted[sorted.length - 1].precio;
  const diffMin = ((minML - precioVenta) / precioVenta * 100);

  console.log('  ' + '─'.repeat(W - 2));
  console.log(`\n  Rango ML    : ${formatPesos(minML)}  —  ${formatPesos(maxML)}`);
  console.log(`  Tu venta    : ${formatPesos(precioVenta)}`);

  if (diffMin < -10) {
    console.log('\n  ⚠️  ATENCIÓN: hay publicaciones bastante más baratas que tu precio de venta');
  } else if (diffMin < 0) {
    console.log('\n  ⚠️  Hay publicaciones más baratas que tu precio de venta en ML');
  } else {
    console.log(`\n  ✅  Tu precio es competitivo (el más barato de ML está +${diffMin.toFixed(1)}% sobre tu venta)`);
  }
  console.log(`\n  🔗  ${mlUrl}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const codigos = process.argv.slice(2).map(c => c.toUpperCase());

  if (!codigos.length) {
    console.log('\nUso:  node comparar.mjs CODIGO [CODIGO2 ...]\n');
    console.log('Ej:   node comparar.mjs AB-080226');
    console.log('      node comparar.mjs AB-080226 AB-080227\n');
    process.exit(0);
  }

  if (!existsSync(CONFIG_FILE)) {
    const example = {
      email: 'electromoviladm@gmail.com',
      password: 'tu_contraseña_electroestrada',
      ml_client_id: 'OPCIONAL_ver_instrucciones',
      ml_client_secret: 'OPCIONAL_ver_instrucciones',
    };
    console.error('\n❌  No se encontró comparar.config.json\n');
    console.error('    Crealo con:\n    ' + JSON.stringify(example, null, 2).replace(/\n/g, '\n    '));
    process.exit(1);
  }

  let config;
  try { config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8')); } catch {
    console.error('❌  comparar.config.json tiene formato inválido');
    process.exit(1);
  }

  const hasMlAuth = !!(config.ml_client_id && config.ml_client_secret
    && !config.ml_client_id.startsWith('OPCIONAL'));

  // Login Electroestrada
  process.stdout.write('\n🔑  Electroestrada... ');
  const cookies = await loginEstrada(config.email, config.password);
  process.stdout.write('OK');

  // ML Token (opcional)
  let mlToken = null;
  if (hasMlAuth) {
    process.stdout.write('   🔑  MercadoLibre... ');
    try {
      mlToken = await getMlToken(config.ml_client_id, config.ml_client_secret);
      process.stdout.write('OK');
    } catch (e) {
      process.stdout.write(`FALLO (${e.message})`);
    }
  }
  console.log('\n');

  for (const codigo of codigos) {
    process.stdout.write(`🔍  Consultando ${codigo}... `);

    const prod = await getEstradaProduct(codigo, cookies);

    if (!prod) {
      console.log(`\n❌  ${codigo} no encontrado en Electroestrada`);
      continue;
    }

    const mlData = await getMercadoLibrePrices(prod, mlToken);

    console.log('OK');
    printComparison(prod, mlData);
  }

  console.log('');
}

main().catch(e => {
  console.error('\n❌  Error:', e.message);
  process.exit(1);
});
