# Prompt Profesionales

Generador de prompts profesionales con Next.js, React y OpenRouter. Incluye chat, refinamiento, constructor guiado, plantillas y soporte para modelos gratuitos.

## Instalación

```bash
npm install
cp .env.example .env.local
```

Configura `OPENROUTER_API_KEY` en `.env.local`. No expongas esta clave al navegador ni la subas a Git.

## Desarrollo y producción

```bash
npm run dev
npm run build
npm run start
```

En el servidor actual se ejecuta en el puerto 3010. Después de cambiar código, ejecuta `npm run build` y reinicia el proceso Next.js. Si se muestran recursos antiguos, elimina `.next` antes de reconstruir y recarga con Ctrl+F5.

## Modelos

El modelo predeterminado es DeepSeek R1. La lista se centraliza en `lib/openrouter.ts` e incluye DeepSeek R1, Llama 3.3 70B, Mistral 7B, GPT-4o, Gemini 2.5 Pro, DeepSeek Chat y GPT-4o mini. Los modelos gratuitos dependen de límites y disponibilidad de OpenRouter.

## Flujo de uso

1. Elige una plantilla en el constructor guiado.
2. Completa objetivo, rol, audiencia, contexto, instrucciones, formato y calidad.
3. Pulsa Generar y revisa el prompt en el chat.
4. Copia, descarga o usa Mejorar para refinarlo.
5. Cambia de modelo para comparar resultados.

## Estructura

- `app/page.tsx`: pantalla principal.
- `components/prompt-builder.tsx`: constructor guiado y plantillas.
- `components/chat-interface.tsx`: generación, streaming, refinamiento y descarga.
- `lib/openrouter.ts`: modelos, validación y prompts del sistema.
- `lib/prompt-builder.ts`: estado, borrador y puntuación del constructor.
- `app/api/chat/route.ts`: API segura del servidor.
- `app/ayuda/page.tsx`: guía para usuarios.

## Seguridad

La clave de OpenRouter debe permanecer en el servidor. El endpoint valida el modelo y limita el contexto. Los datos de repositorios deben ser públicos y no contener secretos.


## Carga de archivos

La aplicación permite adjuntar archivos de texto o PDF desde la sección Base de Conocimiento. Se aceptan TXT, Markdown, CSV, JSON y código, además de PDF. El límite es 5 MB por archivo y el contenido se procesa temporalmente, limitado a 8.000 caracteres para el contexto del modelo. No se almacenan archivos permanentemente.
