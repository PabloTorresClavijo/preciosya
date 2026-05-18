# PRECIOSYA

Comparador de precios de supermercado en tiempo real. Consulta y compara los precios de Mercadona, Carrefour, Dia y Lidl en un mismo lugar, sin moverte de casa.

---

## ¿Qué es?

PRECIOSYA es una aplicación web que permite al usuario buscar productos de alimentación y comparar su precio entre los principales supermercados españoles. El objetivo es simple: que el usuario siempre sepa dónde le sale más barato su compra.

---

## Funcionalidades

- **Búsqueda de productos** con autocompletado en tiempo real
- **Comparativa de precios** entre Mercadona, Carrefour, Dia y Lidl
- **Filtros** por supermercado, categoría, precio mínimo, precio máximo y ordenación
- **Carrito de la compra** con sincronización entre sesiones
- **Lista de favoritos** para guardar productos de interés
- **Registro e inicio de sesión** de usuarios
- **Modo claro / oscuro**
- **Panel de administración** para gestionar el catálogo de productos (añadir, editar, eliminar)
- **Información de alérgenos** por producto
- **Compartir productos** directamente desde la app

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS, JavaScript vanilla |
| Backend | PHP |
| Base de datos | MySQL |
| Autenticación | Sesiones PHP (`auth.php`) |
| API interna | `api.php` (productos, carrito, favoritos) |
| Persistencia local | `localStorage` (fallback sin sesión) |
| Iconos | Material Symbols Rounded (Google) |
| Tipografía | Bebas Neue, IBM Plex Mono |

---

## Estructura del proyecto

```
PRECIOSYA/
├── index.html              # Página principal
├── admin.html              # Panel de administración
├── 404.html                # Página de error personalizada
├── styles.css              # Estilos globales
├── admin_styles.css        # Estilos del panel admin
├── app.js                  # Lógica principal del frontend
├── admin_app.js            # Lógica del panel admin
├── api.php                 # Endpoints de productos, carrito y favoritos
├── auth.php                # Registro, login y sesión
├── database.sql            # Esquema e importación de la base de datos
├── generar_hash.php        # Utilidad para generar hashes de contraseñas
├── productos.json          # Catálogo de productos en local
├── ideas.txt               # Notas y roadmap del proyecto
└── img/
    ├── logo.png
    ├── logo2.png
    └── productos/          # Imágenes de los productos
```

---

## Instalación

1. Clona el repositorio en tu servidor local (XAMPP, Laragon, etc.)
2. Importa la base de datos SQL en MySQL
3. Configura la conexión a la base de datos en `api.php` y `auth.php`
4. Abre `index.html` desde el servidor local

---

## Panel de administración

Accesible desde `/admin.html`. Requiere credenciales de administrador. Permite gestionar el catálogo completo: crear productos, editar precios por supermercado, subir imágenes y marcar disponibilidad por cadena.

---

## Diseño

Estética **brutalist funcional**. Esquinas rectas, tipografía condensada, un único color de acento verde. La interfaz no compite con los datos — los presenta.