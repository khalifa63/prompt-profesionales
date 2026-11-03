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
