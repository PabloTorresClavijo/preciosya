# <div align="center"> 🛒 PRECIOSYA — Comparador de Precios de Supermercado </div>

<div align="center">

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white) ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white) ![API REST](https://img.shields.io/badge/api_rest-%230055ff.svg?style=for-the-badge&logo=api-dot-video&logoColor=white) ![LocalStorage](https://img.shields.io/badge/localStorage-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)

</div>

<br>

> [!NOTE]
> **Repositorio público de portfolio** — El código fuente completo se mantiene en un repositorio privado por razones de seguridad y propiedad intelectual. Este espacio sirve como portfolio técnico y documentación de arquitectura para reclutadores y desarrolladores interesados en el proyecto.

<div align="center">

<br>

Comparador de precios de supermercado en tiempo real. Consulta y compara los precios de **Mercadona, Carrefour, Dia y Lidl** en un mismo lugar, sin moverte de casa.

<br>

---

</div>

### 📸 Vista previa

<div align="center">

*(Captura de pantalla de la aplicación)*

<br>

---

</div>

### 🚀 Tecnologías utilizadas

<div align="center">

| Frontend | Backend | Persistencia |
|:---:|:---:|:---:|
| HTML5 / CSS3 | PHP (API interna) | MySQL |
| JavaScript Vanilla | `api.php` (productos, carrito, favoritos) | `localStorage` (fallback sin sesión) |
| Material Symbols (Google) | `auth.php` (sesiones PHP) | `productos.json` (catálogo local) |
| Bebas Neue / IBM Plex Mono | — | — |

<br>

---

</div>

### ✨ Características

<div align="center">

| **General** |
|:---|
| 🔍 Búsqueda de productos con autocompletado en tiempo real |
| 💰 Comparativa de precios entre Mercadona, Carrefour, Dia y Lidl |
| 🎛️ Filtros por supermercado, categoría, precio mínimo, precio máximo y ordenación |
| 🛒 Carrito de la compra con sincronización entre sesiones |
| ⭐ Lista de favoritos para guardar productos de interés |
| 👤 Registro e inicio de sesión de usuarios |
| 🌙 Modo claro / oscuro |
| ⚠️ Información de alérgenos por producto |
| 🔗 Compartir productos directamente desde la app |

<br>

| **Secciones de la web** |
|:---|
| 🏠 **Inicio** — Buscador principal, comparativa en tiempo real y filtros |
| 🛒 **Carrito** — Gestión de productos seleccionados con resumen de compra |
| ❤️ **Favoritos** — Lista personalizada de productos guardados |
| 🔐 **Cuenta** — Registro, inicio de sesión y gestión de perfil |
| 🛠️ **Admin** — Panel de administración del catálogo completo |

<br>

| **Panel de Administración** |
|:---|
| ✅ Acceso restringido con credenciales de administrador |
| ✅ Crear, editar y eliminar productos del catálogo |
| ✅ Edición de precios por supermercado de forma independiente |
| ✅ Subida de imágenes de productos |
| ✅ Marcar disponibilidad por cadena de supermercado |

<br>

---

</div>

### 🔒 Seguridad

<div align="center">

| Medida | Descripción |
|:---|:---|
| Autenticación por sesiones | Sistema de login con `auth.php` y sesiones PHP nativas |
| Protección de rutas | Panel de administración restringido a usuarios autorizados |
| Validación de inputs | Sanitización en frontend y backend |
| Prepared Statements | Protección contra inyección SQL en todas las consultas |
| Persistencia segura | `localStorage` solo como fallback sin datos sensibles |

<br>

---

</div>

### 📁 Estructura del proyecto

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

<div align="center">

<br>

---

</div>

### ⚙️ Instalación

1. Clona el repositorio en tu servidor local (XAMPP, Laragon, etc.)
2. Importa `database.sql` en tu instancia de MySQL
3. Configura la conexión a la base de datos en `api.php` y `auth.php`
4. Abre `index.html` desde el servidor local

<div align="center">

<br>

---

</div>

### 🎨 Diseño

<div align="center">

Estética **brutalist funcional**. Esquinas rectas, tipografía condensada (**Bebas Neue** + **IBM Plex Mono**), un único color de acento verde. La interfaz no compite con los datos — los presenta.

<br>

---

<sub>Hecho con el objetivo de que nadie pague de más en el súper 🛒</sub>

</div>
