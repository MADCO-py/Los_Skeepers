# assets/stickers/ — guía rápida (leer antes de tocar stickers)

Esta carpeta organiza TODOS los stickers ilustrados que existen en el sitio,
separados según dónde se usan. Todo lo que hay acá son ilustraciones propias
del sitio (no son memes de terceros ni personajes con derechos de autor).

## /whatsapp/
Los 3 stickers que cada integrante puede mandar en el chat de WhatsApp
(dentro de su página de integrante). Nomenclatura: `{slug}-1.png`, `{slug}-2.png`,
`{slug}-3.png`. Ninguno se repite dentro del mismo integrante:

- `{slug}-1.png` → versión "skibidi" (graciosa/editada) — se manda con la
  respuesta de la canción favorita.
- `{slug}-2.png` → el "char" de cuerpo completo (el mismo que aparece parado
  en el wallpaper de Windows XP en Síguenos) — se manda con la respuesta de
  antes del escenario.
- `{slug}-3.png` → el sketch a mano (el mismo que flota como decoración en
  varias secciones) — se manda con el mensaje de cierre.

Esto se usa desde `CHAT_QA` en el JS (buscar el comentario
"chat estilo WhatsApp dentro de cada integrante").

Slugs válidos: alex, danniel, jeremy, joaquin, juan, shipi.

## /collage/
Los stickers que se pueden arrastrar en la herramienta de fotomontaje
(sección Móntate), organizados en las mismas 4 categorías que ya existen ahí:

- `/collage/integrantes/{slug}.png` — el "char" de cuerpo completo de cada uno.
- `/collage/skeepers/{slug}.png` — la versión "skibidi"/graciosa de cada uno.
- `/collage/logo/logo-red.png` y `logo-black.png` — el logo de la banda.
- `/collage/estrella/frame-star-art.png` y `star-sketch-outline.png` — arte
  de estrella.

Esto se usa desde `STICKER_CATEGORIES` en el JS (buscar el comentario
"Móntate: catálogo de stickers").

## Importante para quien siga trabajando en este sitio
- Los archivos originales (`assets/char-*.png`, `assets/skibidi-*.png`,
  `assets/sketch-*.png`, etc.) SIGUEN existiendo en `assets/` directamente,
  porque también se usan en otras partes del sitio (personajes flotantes
  decorativos, wallpaper de Síguenos, etc.). Los de esta carpeta son copias
  con nombres más claros, específicamente para whatsapp/collage — no son
  la única copia ni el archivo "canónico".
- Si la banda manda memes, capturas de otras cuentas, fotos de personajes de
  películas/series, o fotos de gente que no es la banda para usar como
  sticker: NO se deben subir a esta carpeta ni usarse en el sitio, sin
  importar cómo se hayan generado (incluye imágenes hechas con IA que
  reproduzcan personajes con derechos de autor reconocibles). Esto ya se
  conversó explícitamente con el cliente — si insiste, remitirse a esta nota
  en vez de recrear la conversación desde cero.
