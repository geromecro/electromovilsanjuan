# Visibilidad en buscadores con IA — línea de base 19/11/2026

## Medición antes de los cambios (19/11/2026)

| Búsqueda (Google Modo IA, udm=50) | Puesto Electromóvil / Baterías Electro |
|---|---|
| baterías en san juan | Electromóvil 4º de 10 (arriba: Luxor 394 reseñas, Rally Car 516, Pinobat 383) |
| dónde reparo el alternador en san juan | Electromóvil 3º de 5 |
| baterías para flota de camiones san juan mayorista | Baterías Electro 1º, fuente principal citada |
| Bing "baterías san juan argentina" | Ficha 3ª en mapa + 2 páginas propias en orgánico |
| Bing "electromovil san juan" | 1º |

Reseñas Google Electromóvil: 4,6 con 257.

## Cambios hechos el 19/11/2026

- electromovilsanjuan.com: llms.txt reescrito (preguntas típicas, todas las páginas, marcas Moura/Sermat/Pioneiro/Reymax, enlace a bateriaselectro), reviewCount 201→257, marcas unificadas, sitemap con lastmod nuevo.
- electromovilsanjuan.com: se restauró lo que pisó el deploy del 18/11 hecho desde OTRA PC (Vercel CLI 65.17, copia vieja): página /equipamiento-minero/ (daba 404), precios de julio ($95.000), enlace a bateriaselectro. Se conservó la corrección "Venínos" que traía ese deploy.
- bateriaselectro.com: llms.txt nuevo, "224 reseñas" → "más de 250", CP J5402.
- Perfil de Google Electromóvil: categoría adicional "Servicio eléctrico para autos"; teléfono adicional 0264 422-3645 (principal sigue 622-7950). Ambos quedaron "pendientes de revisión" de Google.

## Pendiente (decisión del dueño)

- Año de fundación: la web dice 1976; el perfil de Google dice 27/08/1985 y bateriaselectro dice "41 años" (1985). Unificar.
- Perfil de Google "Baterías Electro" sin verificar, con dirección Hipólito Yrigoyen Este 1395 (distinta del local).
- Pedir reseñas a clientes (los 3 de arriba tienen 380–520).
- La otra PC que despliega la web: hacer `git pull` antes de cualquier `vercel --prod`.
