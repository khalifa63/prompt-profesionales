# Manual de usuario

## Crear un prompt

Usa el Constructor guiado. Puedes comenzar con Marketing, Código, Investigación o Educación. Completa cada paso y usa Siguiente para avanzar. La puntuación indica cuántas áreas importantes ya definiste.

## Campos recomendados

- **Objetivo:** resultado medible.
- **Rol:** experiencia que debe asumir el modelo.
- **Audiencia:** quién utilizará la respuesta.
- **Contexto:** datos y fuentes de verdad.
- **Instrucciones:** pasos concretos.
- **Formato:** tabla, Markdown, JSON o texto.
- **Calidad y límites:** criterios observables y restricciones.

## Generar y refinar

El constructor prepara la petición en el chat. Pulsa enviar para generar. En cada respuesta puedes copiar, descargar o pulsar Mejorar. Cambia el modelo desde el selector superior.

## Placeholders

Para crear prompts reutilizables usa marcadores como `[PRODUCTO]`, `[AUDIENCIA]`, `[TONO]` o `[FORMATO_DE_SALIDA]`. Sustitúyelos antes de usar el prompt final.

## Modelos gratuitos

DeepSeek R1, Llama 3.3 70B y Mistral 7B pueden estar disponibles en el free tier de OpenRouter. Sus límites, disponibilidad y velocidad pueden cambiar; si falla una solicitud, prueba otro modelo o espera a que se renueve el límite.


## Carga de archivos

La aplicación permite adjuntar archivos de texto o PDF desde la sección Base de Conocimiento. Se aceptan TXT, Markdown, CSV, JSON y código, además de PDF. El límite es 5 MB por archivo y el contenido se procesa temporalmente, limitado a 8.000 caracteres para el contexto del modelo. No se almacenan archivos permanentemente.


## Plantilla de viajes

El botón Viajes prepara un prompt para itinerarios personalizados. Completa destino, fechas, presupuesto y preferencias usando los marcadores `[DESTINO]`, `[FECHAS]`, `[PRESUPUESTO]` y `[PREFERENCIAS]`; después genera el prompt y verifica precios, horarios y disponibilidad.


## Últimas interacciones

El constructor guarda localmente en el navegador el último borrador y prompt de cada categoría. Al regresar al proyecto desde el mismo navegador, se recupera automáticamente el último estado. Los datos no se envían a un servidor ni se comparten; se eliminan al limpiar los datos del sitio o usar el botón Limpiar.
