# SEO Tracking CSV

## Archivos
- `control-semanal-seo.csv`: carga semanal de Search Console + leads.
- `gbp-resenas.csv`: control semanal de Google Business Profile y resenas.
- `contenido-enlaces.csv`: registro de landings nuevas y enlaces locales.
- `funnel-semanal.csv`: embudo Google Ads -> WhatsApp -> ventas -> resenas.
- `postventa-clientes.csv`: base para seguimientos postventa por WhatsApp.

## Frecuencia recomendada
1. Lunes: completar `control-semanal-seo.csv`.
2. Miercoles: completar `gbp-resenas.csv`.
3. Viernes: actualizar `contenido-enlaces.csv` y decidir 1 ajuste.

## Google Sheets (setup rapido)
1. Crear una hoja nueva en Google Sheets.
2. Importar cada CSV en una pestaña separada:
   - `control-semanal-seo`
   - `gbp-resenas`
   - `contenido-enlaces`
3. En `control-semanal-seo`, usar estas formulas:
   - CTR automatico (si preferis calcularlo y no cargarlo manual):
     - en `F2`: `=IFERROR((E2/D2)*100,0)`
   - Semaforo posicion:
     - en `K1` crear columna `semaforo_posicion`
     - en `K2`: `=IF(G2=0,"sin datos",IF(G2<=3,"verde",IF(G2<=10,"amarillo","rojo")))`
   - Semaforo leads:
     - en `L1` crear columna `semaforo_leads`
     - en `L2`: `=IF(I2=0,"rojo",IF(I2<=2,"amarillo","verde"))`
4. En `gbp-resenas`, crear alertas:
   - en `J1` crear columna `alerta_operativa`
   - en `J2`: `=IF(OR(B2<4,D2<100,E2<2,F2<3),"accion","ok")`
5. Aplicar formato condicional:
   - Texto `verde` fondo verde.
   - Texto `amarillo` fondo amarillo.
   - Texto `rojo` fondo rojo.

## Reglas de accion semanales
- Si impresiones suben y clics no: ajustar `title` y `meta description`.
- Si clics suben y leads no: ajustar CTA de WhatsApp.
- Si posicion no mejora en 3-4 semanas: sumar contenido y enlaces locales hacia esa URL.

## Automatizaciones por CLI
Desde la carpeta `electromovilsanjuan`:

1. Reporte semanal del embudo con alertas:
   - `npm run ops:funnel`
2. Lista diaria de seguimientos postventa con links listos de WhatsApp:
   - `npm run ops:postventa`
