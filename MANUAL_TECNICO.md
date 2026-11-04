# Manual técnico

## Stack

Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI y SDK OpenAI apuntando a OpenRouter.

## Configuración

Define `OPENROUTER_API_KEY` en `.env.local`. El servidor utiliza `https://openrouter.ai/api/v1`. El endpoint `app/api/chat/route.ts` valida modelos, limita mensajes y contexto, y soporta streaming SSE.

## Añadir un modelo

Edita `AVAILABLE_MODELS` en `lib/openrouter.ts`. Usa el identificador exacto de OpenRouter, añade nombre, descripción y badge. Para cambiar el predeterminado, coloca el modelo deseado en la primera posición o actualiza `DEFAULT_MODEL`.

## Constructor guiado

`lib/prompt-builder.ts` define el estado, pasos, ensamblado del borrador y puntuación. `components/prompt-builder.tsx` muestra las plantillas y envía el borrador al chat mediante el evento `prompt-builder-generate`.

## Despliegue

```bash
npm install
npm run build
# detener el proceso anterior
# iniciar
npm run start
```

Si el proceso usa otro usuario, deténlo con ese usuario o mediante el supervisor correspondiente. Verifica el puerto con `ss -ltnp | grep 3010`. Ante un bundle obsoleto, ejecuta `rm -rf .next && npm run build` y reinicia.

## Mantenimiento

No versionar `.env.local`, logs ni `.next`. Validar con `npm run build` antes de publicar. Los cambios de UI deben verificarse en escritorio y móvil.


## Carga de archivos

La aplicación permite adjuntar archivos de texto o PDF desde la sección Base de Conocimiento. Se aceptan TXT, Markdown, CSV, JSON y código, además de PDF. El límite es 5 MB por archivo y el contenido se procesa temporalmente, limitado a 8.000 caracteres para el contexto del modelo. No se almacenan archivos permanentemente.


## Plantilla de viajes

El botón Viajes prepara un prompt para itinerarios personalizados. Completa destino, fechas, presupuesto y preferencias usando los marcadores `[DESTINO]`, `[FECHAS]`, `[PRESUPUESTO]` y `[PREFERENCIAS]`; después genera el prompt y verifica precios, horarios y disponibilidad.


## Últimas interacciones

El constructor guarda localmente en el navegador el último borrador y prompt de cada categoría. Al regresar al proyecto desde el mismo navegador, se recupera automáticamente el último estado. Los datos no se envían a un servidor ni se comparten; se eliminan al limpiar los datos del sitio o usar el botón Limpiar.


## Por qué importa un buen prompt

Un prompt claro transforma una intención en instrucciones concretas. Definir rol, objetivo, contexto, formato y restricciones reduce ambigüedad, evita respuestas inventadas y hace que los resultados sean más consistentes, comparables y reutilizables.


## SEO e indexación

La app incluye metadata dinámica, canonical, Open Graph, Twitter Cards, datos estructurados `WebApplication`, `sitemap.xml`, `robots.txt` y una imagen social generada. Define `NEXT_PUBLIC_SITE_URL` con el dominio público real y opcionalmente `GOOGLE_SITE_VERIFICATION` antes del build. Registra `/sitemap.xml` en Google Search Console y Bing Webmaster Tools. No se indexan `/api/` ni recursos internos.


## Carga de imágenes

En Base de Conocimiento se pueden adjuntar imágenes JPG, JPEG, PNG, GIF, WebP, BMP, TIFF, SVG y AVIF, además de texto y PDF. El límite es 5 MB por archivo. La imagen se previsualiza y se envía como contexto multimodal al modelo seleccionado cuando el proveedor lo admite; el contenido se procesa temporalmente y no se almacena permanentemente.
