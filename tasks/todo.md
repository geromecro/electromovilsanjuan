# Consolidación del cluster de baterías — 2026-07-27

## Diagnóstico (GSC, 90 días: 2026-04-28 → 2026-07-27)

Canibalización confirmada en la query principal `baterias en san juan`:
**6 URLs compitiendo, 351 impresiones, 2 clics.**

| URL | Impr. | Pos. |
|---|---|---|
| /baterias-san-juan/ | 159 | 8,5 |
| /bateria-moura-san-juan/ | 125 | 9,9 |
| www home | 55 | 15,2 |
| home (apex) | 9 | 17 |
| /precio-bateria-auto-san-juan/ | 2 | 15 |
| /baterias-de-auto-san-juan/ | 1 | 8 |

Prueba adicional: en `baterias en san juan precios`, la página dedicada
(/precio-bateria-auto-san-juan/) rankea en **pos. 18,1** mientras el hub
genérico rankea en **8,6**. La página específica pierde contra el hub en su
propia query objetivo.

## Veredicto por página

| Página | Impr. 90d (queries de batería) | Clics | Intención propia | Decisión |
|---|---|---|---|---|
| /baterias-san-juan/ | ~370 | 5 | Hub + long-tail (willard, medidas, a domicilio) | **Conservar** |
| /bateria-moura-san-juan/ | ~267 | 3 | Sí — pos. 5,9–7,1 en queries "moura", mejor que el hub (9,0) | **Conservar** |
| /precio-bateria-auto-san-juan/ | 10 | 1 | No — pierde contra el hub en su propia query | Consolidar |
| /baterias-de-auto-san-juan/ | 2 | 0 | No | Consolidar |
| /diagnostico-bateria-san-juan/ | 0 | 0 | No — sólo rankea para la query de marca | Consolidar |

Justificación de contenido: el hub (84 KB) ya contiene el H2
"¿Cuánto sale una batería en San Juan?" — **idéntico** al H2 principal de la
página de precios — más "Diagnóstico gratuito en 5 minutos" y "Cómo elegir la
medida correcta". Las 3 páginas thin (8–11 KB) son duplicados temáticos de
secciones que ya existen.

## Hecho

- [x] 301 de las 3 URLs → /baterias-san-juan/ en `vercel.json` (con y sin barra final)
- [x] Quitados los `<li>` del footer en las 4 landings premium
- [x] Repuntado el link del cuerpo en moura → `/baterias-san-juan/#precios` (ancla verificada, L262)
- [x] Sitemap: 9 → 6 URLs
- [x] Borrados los 3 directorios de `public/` (vía `git rm`, recuperable)
- [x] Verificado: 0 referencias colgadas, JSON válido

## Pendiente (requiere decisión del usuario)

- [ ] **Deploy**: producción sale de esta rama, así que el push despliega.
- [ ] **Sitelink de Ads**: `/baterias-de-auto-san-juan/` es sitelink activo.
      Repuntar a `/baterias-san-juan/` ANTES o justo después del deploy.
- [ ] Verificar los 301 en vivo después del deploy (deben dar 308/301, no 404).

## No hecho a propósito

- **No se tocaron titles.** El baseline del 24/07 está en ventana de medición
  con checkpoint a fin de agosto.
- **No se tocó /bateria-moura-san-juan/** pese a que solapa con el hub en
  queries genéricas: es la página que más creció (1 → 16 clics) y rankea mejor
  que el hub en su propia marca.

## Expectativa honesta

Las 3 páginas eliminadas aportaban ~12 de 351 impresiones (3%) en la query
principal. **Esto por sí solo no va a mover `baterias en san juan` de la
posición 8,5.** El beneficio real es dejar de mostrar páginas thin en la query
de marca y concentrar los links internos. El split grande que queda es
hub vs. moura vs. home.
