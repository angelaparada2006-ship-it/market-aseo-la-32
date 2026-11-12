# Market De Aseo La 32 — Sitio web

Sitio estático desarrollado con HTML, CSS y JavaScript. No requiere instalación ni proceso de compilación.

## Archivos
- `index.html`: estructura y contenido de la página.
- `styles.css`: colores y diseño adaptable.
- `config.js`: datos del negocio y conexiones.
- `app.js`: catálogo, formulario, API y analítica.
- `products.json`: catálogo local de productos (vacío inicialmente).
- `robots.txt`: permite el rastreo del sitio.

## Publicación con GitHub Pages
En el repositorio, entra a **Settings → Pages**. En **Build and deployment**, selecciona **Deploy from a branch**, elige la rama **main** y la carpeta **/(root)**, y guarda.

Después de que GitHub termine la publicación, la dirección será:
https://angelaparada2006-ship-it.github.io/market-aseo-la-32/

## Actualizar productos
Agrega productos en `products.json` como una lista JSON. Cada producto puede incluir `nombre`, `categoria`, `precio`, `descripcion` e `imagen`.

## Configuración
Los datos de contacto y las conexiones se editan en `config.js`. Este archivo es público; no guardes contraseñas ni claves secretas allí. Si no configuras un endpoint para el formulario, los mensajes se preparan para enviarse por WhatsApp.
