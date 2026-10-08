# VisionInclusiva · Web del proyecto

Web oficial de **VisionInclusiva: Eliminación de Barreras mediante Visión por Computador e Inteligencia Artificial**, un proyecto de innovación tecnológica de Formación Profesional de Canarias (curso 2026–2027) coordinado por el IES Lomo de La Herradura, con el IES Primero de Mayo, el CIFP Cruz de Piedra y la Asociación Pro Inclusiva.

## Estructura

```
index.html        Página única con todo el contenido
css/styles.css    Estilos y temas (claro, oscuro, alto contraste)
js/main.js        Mejoras progresivas: tamaño de texto, tema, menú móvil, carrusel de noticias
assets/           Favicon
logos/            Logos del proyecto y de las instituciones (ver logos/LEEME.txt)
especificaciones/ Texto base del proyecto
```

Es HTML, CSS y JavaScript estáticos, sin dependencias ni proceso de compilación.

## Noticias

La sección **Noticias** (`#noticias`, en el menú principal) muestra las acciones del proyecto en un carrusel. Sin JavaScript se ve como una lista apilada; con JavaScript se añaden los botones Anterior/Siguiente, sin autoplay, y las noticias fuera de vista no reciben foco.

Para añadir una noticia, copia un `<li class="news-item">` dentro de `<ul class="news-track">` en `index.html` (la más reciente, la primera) y cambia fecha, título, texto y acción desarrollada.

## Accesibilidad

La web está pensada para personas con baja visión o ceguera:

- Contraste de texto AAA (≥ 7:1) en los tres temas.
- Tamaño de texto ajustable hasta el 200 % sin desbordamientos.
- Tipografía Atkinson Hyperlegible.
- Navegación completa por teclado, enlace para saltar al contenido y estructura semántica para lectores de pantalla.
- Carrusel de noticias sin movimiento automático, con roles ARIA y controles de 44 px.
- Respeta `prefers-color-scheme`, `prefers-contrast` y `prefers-reduced-motion`.

## Verla en local

```bash
python -m http.server 8765
```

Y abrir http://localhost:8765

## Etiqueta

#InnovaFpCan
