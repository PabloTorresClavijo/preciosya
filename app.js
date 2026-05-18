document.addEventListener("DOMContentLoaded", () => {

    // ------------------ ELEMENTOS DOM ------------------
    const input = document.getElementById("searchInput");
    const resultados = document.getElementById("resultados");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const filtroPrecioMin = document.getElementById("filtroPrecioMin");
    const filtroPrecioMax = document.getElementById("filtroPrecioMax");
    const suggestionsBox = document.getElementById("suggestions");
    const tituloResultados = document.getElementById("tituloResultados");
    const filtroSuper = document.getElementById("filtroSuper");

    const darkToggle = document.getElementById("darkToggle");
    const favToggle = document.getElementById("favToggle");
    const cartToggle = document.getElementById("cartToggle");
    const carritoPanel = document.getElementById("carritoPanel");
    const filtroOrden = document.getElementById("filtroOrden");

    // ------------------ PLACEHOLDER ANIMADO ------------------
    const placeholders = [
        "Buscar leche...",
        "Buscar pan...",
        "Buscar yogur...",
        "Buscar pollo...",
        "Buscar atún...",
        "Buscar coca-cola...",
        "Buscar arroz...",
        "Buscar chocolate...",
        "Buscar cerveza...",
        "Buscar aceite..."
    ];

    let placeholderIndex = 0;
    let placeholderInterval = null;

    function animarPlaceholder() {
        placeholderInterval = setInterval(() => {
            if (input.value || document.activeElement === input) return;
            input.placeholder = "";
            const texto = placeholders[placeholderIndex % placeholders.length];
            let i = 0;
            const escribir = setInterval(() => {
                input.placeholder = texto.slice(0, i + 1);
                i++;
                if (i >= texto.length) {
                    clearInterval(escribir);
                    setTimeout(() => {
                        const borrar = setInterval(() => {
                            input.placeholder = input.placeholder.slice(0, -1);
                            if (!input.placeholder) {
                                clearInterval(borrar);
                                placeholderIndex++;
                            }
                        }, 40);
                    }, 1500);
                }
            }, 70);
        }, 3500);
    }

    animarPlaceholder();
    input.addEventListener("focus", () => input.placeholder = "Buscar producto...");
    input.addEventListener("blur", () => {
        if (!input.value) input.placeholder = placeholders[placeholderIndex % placeholders.length];
    });

    // ------------------ ESTADO ------------------
    let productosBase = [];
    let productos = [];
    let productosFiltrados = [];
    let renderCount = 0;
    const PAGE_SIZE = 27;

    const FAVORITOS_KEY = "preciosya_favoritos";
    const THEME_KEY = "preciosya_tema";
    const CARRITO_KEY = "preciosya_carrito";
    const CUSTOM_PRODUCTS_KEY = "preciosya_custom_products";

    let carrito = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

    // ============================================================
    // SISTEMA DE CUENTAS — Estado de sesión
    // ============================================================
    let usuarioActual = null; // null = no logueado, objeto = { id, nombre, email }

    // Comprueba si hay sesión activa al cargar la página
    async function comprobarSesion() {
        try {
            const res = await fetch("auth.php?action=sesion", { credentials: "include" });
            const data = await res.json();
            if (data.logueado) {
                usuarioActual = data.usuario;
                actualizarUIUsuario();
                // Si hay sesión, cargar favoritos y carrito desde el servidor
                await cargarFavoritosServidor();
                await cargarCarritoServidor();
            }
        } catch (e) {
            // Si falla (sin conexión, etc.) seguimos con localStorage
            console.warn("No se pudo comprobar sesión:", e);
        }
    }

    // Actualiza el botón de cuenta en el header según si hay sesión
function actualizarUIUsuario() {
    const btnCuenta = document.getElementById("btnCuenta");
    if (!btnCuenta) return;
    if (usuarioActual) {
        btnCuenta.innerHTML = `<span class="material-symbols-rounded">account_circle</span>`;
        btnCuenta.title = `Cuenta: ${usuarioActual.nombre}`;
        btnCuenta.classList.add("logueado");
    } else {
        btnCuenta.innerHTML = `<span class="material-symbols-rounded">account_circle</span>`;
        btnCuenta.title = "Iniciar sesión";
        btnCuenta.classList.remove("logueado");
    }
    actualizarMenuHamburguesa(); // ← AÑADIR ESTA LÍNEA
}

    // ============================================================
    // FAVORITOS — con soporte servidor
    // ============================================================
    let favoritosLocales = [];

    async function cargarFavoritosServidor() {
        try {
            const res = await fetch("api.php?accion=favoritos", { credentials: "include" });
            const data = await res.json();
            // Siempre reemplazar con lo que diga el servidor (array vacío incluido)
            favoritosLocales = (data.favoritos || []).map(Number);
            localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosLocales));
        } catch (e) {
            console.warn("No se pudieron cargar favoritos del servidor:", e);
        }
    }

    function getFavoritos() {
        if (usuarioActual) return favoritosLocales;
        try { return JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || []; }
        catch { return []; }
    }

    function esFavorito(id) {
        return getFavoritos().includes(id);
    }

    async function toggleFavorito(id) {
        if (!usuarioActual) {
            // Sin sesión → mostrar modal de login
            abrirAuthModal("fav", id);
            return;
        }
        // Con sesión → llamar a la API
        try {
            const res = await fetch("api.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "favorito_toggle", producto_id: id })
            });
            const data = await res.json();
            if (data.ok) {
                if (data.accion === "añadido") {
                    favoritosLocales.push(id);
                } else {
                    favoritosLocales = favoritosLocales.filter(f => f !== id);
                }
                localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosLocales));
            }
        } catch (e) {
            console.error("Error al cambiar favorito:", e);
        }
    }

    // ============================================================
    // CARRITO — con soporte servidor
    // ============================================================
    async function cargarCarritoServidor() {
        try {
            const res = await fetch("api.php?accion=carrito", { credentials: "include" });
            const data = await res.json();
            // Siempre resetear el carrito al cargar desde el servidor (evita mezclar datos entre usuarios)
            carrito = [];
            localStorage.removeItem(CARRITO_KEY);
            if (data.carrito) {
                // Reconstruir el array de carrito con los objetos producto completos
                data.carrito.forEach(item => {
                    // Convertir a Number porque la BD devuelve strings
                    const prodId = Number(item.producto_id);
                    const prod = productosBase.find(p => p.id === prodId);
                    if (prod) {
                        for (let i = 0; i < Number(item.cantidad); i++) {
                            carrito.push(prod);
                        }
                    }
                });
                if (carrito.length) localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
            }
            // Actualizar UI siempre, aunque el carrito esté vacío
            actualizarContadorCarrito();
            renderCarrito();
        } catch (e) {
            console.warn("No se pudo cargar carrito del servidor:", e);
        }
    }

    async function agregarAlCarrito(prod) {
        if (!usuarioActual) {
            // Sin sesión → mostrar modal de login
            abrirAuthModal("carrito", prod.id);
            return;
        }
        // Con sesión → añadir al servidor
        carrito.push(prod);
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
        actualizarContadorCarrito();
        animarCarrito();
        renderCarrito();

        try {
            const res = await fetch("api.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "carrito_add", producto_id: prod.id, cantidad: 1 })
            });
            const data = await res.json();
        } catch (e) {
            console.error("Error al añadir al carrito en servidor:", e);
        }
    }

    // ============================================================
    // SINCRONIZACIÓN localStorage → servidor tras login
    // Solo sube datos si el usuario estaba usando la app SIN sesión
    // (localStorage con items). En un re-login el localStorage está
    // vacío (lo limpiamos al hacer logout) así que simplemente carga
    // los datos del servidor sin tocar nada.
    // ============================================================
    async function sincronizarDatosLocales() {
        const favsLocales = JSON.parse(localStorage.getItem(FAVORITOS_KEY)) || [];
        const carritoLocal = JSON.parse(localStorage.getItem(CARRITO_KEY)) || [];

        // Solo sincronizar si había datos locales (usuario estaba sin sesión)
        if (favsLocales.length) {
            try {
                await fetch("api.php", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "favoritos_sync", ids: favsLocales })
                });
            } catch (e) { console.warn("Error sync favoritos:", e); }
        }

        if (carritoLocal.length) {
            const agrupado = [];
            carritoLocal.forEach(p => {
                const ex = agrupado.find(a => a.producto_id === p.id);
                if (ex) ex.cantidad++;
                else agrupado.push({ producto_id: p.id, cantidad: 1 });
            });
            try {
                await fetch("api.php", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accion: "carrito_sync", items: agrupado })
                });
            } catch (e) { console.warn("Error sync carrito:", e); }
        }

        // Limpiar localStorage y cargar siempre desde el servidor
        // (evita mezclas entre usuarios y garantiza datos frescos)
        localStorage.removeItem(FAVORITOS_KEY);
        localStorage.removeItem(CARRITO_KEY);
        await cargarFavoritosServidor();
        await cargarCarritoServidor();
    }

    // ============================================================
    // MODAL DE AUTENTICACIÓN
    // ============================================================
    // pendingAction guarda qué quería hacer el usuario antes del login
    // para ejecutarlo automáticamente después
    let pendingAction = null; // { tipo: "fav"|"carrito", id: Number }

    function abrirAuthModal(tipoPendiente = null, idPendiente = null) {
        if (tipoPendiente) pendingAction = { tipo: tipoPendiente, id: idPendiente };
        const modal = document.getElementById("authModal");
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
        mostrarLoginForm();
    }

    function cerrarAuthModal() {
        document.getElementById("authModal").classList.add("hidden");
        document.body.style.overflow = "";
        limpiarErroresAuth();
    }

    function mostrarLoginForm() {
        document.getElementById("authLoginForm").classList.remove("hidden");
        document.getElementById("authRegistroForm").classList.add("hidden");
        document.getElementById("authModalTitle").textContent = "Iniciar sesión";
    }

    function mostrarRegistroForm() {
        document.getElementById("authLoginForm").classList.add("hidden");
        document.getElementById("authRegistroForm").classList.remove("hidden");
        document.getElementById("authModalTitle").textContent = "Crear cuenta";
    }

    function limpiarErroresAuth() {
        document.querySelectorAll(".auth-error").forEach(el => el.textContent = "");
    }

    // LOGIN
    document.getElementById("authBtnLogin").addEventListener("click", async () => {
        const email = document.getElementById("authLoginEmail").value.trim();
        const password = document.getElementById("authLoginPass").value.trim();
        const errorEl = document.getElementById("authLoginError");
        errorEl.textContent = "";

        if (!email || !password) {
            errorEl.textContent = "Rellena todos los campos.";
            return;
        }

        const btn = document.getElementById("authBtnLogin");
        btn.disabled = true;
        btn.textContent = "Entrando...";

        try {
            const res = await fetch("auth.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password })
            });
            const data = await res.json();

            if (data.ok) {
                usuarioActual = data.usuario;
                cerrarAuthModal();
                actualizarUIUsuario();
                await sincronizarDatosLocales();
                mostrarNotificacion(`✓ Bienvenido/a, ${usuarioActual.nombre}`);

                // Ejecutar la acción pendiente (favorito o carrito)
                if (pendingAction) {
                    const { tipo, id } = pendingAction;
                    pendingAction = null;
                    const prod = productosBase.find(p => p.id === id);
                    if (tipo === "fav" && prod) {
                        await toggleFavorito(id);
                        actualizarIconosFavorito(id);
                    } else if (tipo === "carrito" && prod) {
                        await agregarAlCarrito(prod);
                    }
                }
            } else {
                errorEl.textContent = data.error || "Error al iniciar sesión.";
            }
        } catch (e) {
            errorEl.textContent = "Error de conexión. Comprueba que XAMPP está activo.";
        }

        btn.disabled = false;
        btn.textContent = "Entrar";
    });

    // REGISTRO
    document.getElementById("authBtnRegistro").addEventListener("click", async () => {
        const nombre = document.getElementById("authRegNombre").value.trim();
        const email = document.getElementById("authRegEmail").value.trim();
        const password = document.getElementById("authRegPass").value.trim();
        const password2 = document.getElementById("authRegPass2").value.trim();
        const errorEl = document.getElementById("authRegistroError");
        errorEl.textContent = "";

        if (!nombre || !email || !password || !password2) {
            errorEl.textContent = "Rellena todos los campos.";
            return;
        }
        if (password !== password2) {
            errorEl.textContent = "Las contraseñas no coinciden.";
            return;
        }

        const btn = document.getElementById("authBtnRegistro");
        btn.disabled = true;
        btn.textContent = "Creando cuenta...";

        try {
            const res = await fetch("auth.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "registro", nombre, email, password })
            });
            const data = await res.json();

            if (data.ok) {
                usuarioActual = data.usuario;
                cerrarAuthModal();
                actualizarUIUsuario();
                await sincronizarDatosLocales();
                mostrarNotificacion(`✓ Cuenta creada. ¡Hola, ${usuarioActual.nombre}!`);

                if (pendingAction) {
                    const { tipo, id } = pendingAction;
                    pendingAction = null;
                    const prod = productosBase.find(p => p.id === id);
                    if (tipo === "fav" && prod) {
                        await toggleFavorito(id);
                        actualizarIconosFavorito(id);
                    } else if (tipo === "carrito" && prod) {
                        await agregarAlCarrito(prod);
                    }
                }
            } else {
                errorEl.textContent = data.error || "Error al crear la cuenta.";
            }
        } catch (e) {
            errorEl.textContent = "Error de conexión. Comprueba que XAMPP está activo.";
        }

        btn.disabled = false;
        btn.textContent = "Crear cuenta";
    });

    // Cerrar modal al pulsar overlay
    document.getElementById("authModalOverlay").addEventListener("click", cerrarAuthModal);
    document.getElementById("authModalClose").addEventListener("click", cerrarAuthModal);

    // Cambiar entre login y registro
    document.getElementById("authIrRegistro").addEventListener("click", mostrarRegistroForm);
    document.getElementById("authIrLogin").addEventListener("click", mostrarLoginForm);

    // LOGOUT
    async function cerrarSesion() {
        try {
            await fetch("auth.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" })
            });
        } catch (e) { /* ignorar */ }
        usuarioActual = null;
        // Limpiar todo en memoria
        favoritosLocales = [];
        carrito = [];
        // Limpiar localStorage para que no queden datos del usuario anterior
        localStorage.removeItem(CARRITO_KEY);
        localStorage.removeItem(FAVORITOS_KEY);
        // Actualizar UI
        actualizarContadorCarrito();
        renderCarrito();
        actualizarUIUsuario();
        filtrarYPrepararRender(); // redibuja tarjetas sin corazones activos
        mostrarNotificacion("Sesión cerrada.");
    }

    // Botón cuenta en el header → si logueado muestra menú de usuario, si no abre login
    document.getElementById("btnCuenta").addEventListener("click", () => {
        if (usuarioActual) {
            abrirMenuUsuario();
        } else {
            abrirAuthModal();
        }
    });

    function abrirMenuUsuario() {
        const panel = document.getElementById("userMenuPanel");
        document.getElementById("userMenuNombre").textContent = usuarioActual.nombre;
        document.getElementById("userMenuEmail").textContent = usuarioActual.email;
        panel.classList.toggle("hidden");
    }

    document.getElementById("userMenuLogout").addEventListener("click", () => {
        document.getElementById("userMenuPanel").classList.add("hidden");
        cerrarSesion();
    });

    // Cerrar menú usuario al pulsar fuera
    document.addEventListener("click", (e) => {
        const panel = document.getElementById("userMenuPanel");
        if (!panel.classList.contains("hidden") &&
            !panel.contains(e.target) &&
            !e.target.closest("#btnCuenta")) {
            panel.classList.add("hidden");
        }
    });

    // Actualiza todos los iconos de favorito visibles en pantalla para un producto concreto
    function actualizarIconosFavorito(id) {
        document.querySelectorAll(`.fav-icon[data-id="${id}"]`).forEach(icon => {
            const esFav = esFavorito(id);
            icon.textContent = esFav ? "♥" : "♡";
            icon.classList.toggle("filled", esFav);
        });
    }

    // Notificación toast
    function mostrarNotificacion(texto) {
        const notif = document.createElement("div");
        notif.className = "toast-notif";
        notif.textContent = texto;
        document.body.appendChild(notif);
        setTimeout(() => notif.classList.add("visible"), 10);
        setTimeout(() => {
            notif.classList.remove("visible");
            setTimeout(() => notif.remove(), 300);
        }, 2800);
    }

    // ------------------ PRECIOS PERSISTENTES ------------------
    function cargarPreciosGuardados() {
        try { return JSON.parse(localStorage.getItem("preciosya_precios")) || {}; }
        catch { return {}; }
    }

    function guardarPrecios(precios) {
        localStorage.setItem("preciosya_precios", JSON.stringify(precios));
    }

    let preciosPersistentes = cargarPreciosGuardados();

    // ------------------ SINÓNIMOS EN ESPAÑOL ------------------
    const sinonimos = {
        "leche": ["lácteo", "dairy", "yogur", "mantequilla"],
        "queso": ["manchego", "cheese"],
        "yogur": ["yogurt", "natillas"],
        "carne": ["pollo", "ternera", "cerdo", "jamón", "salchicha"],
        "pescado": ["merluza", "salmón", "atún", "gambas", "marisco"],
        "pan": ["baguette", "croissant", "magdalena", "bollería"],
        "bebida": ["zumo", "agua", "refresco", "cerveza", "vino"],
        "cafe": ["café", "té", "infusión"],
        "arroz": ["cereal", "pasta", "espagueti", "macarrón"],
        "fruta": ["manzana", "plátano", "naranja", "tomate", "lechuga"],
        "snack": ["galleta", "patata", "palomita", "fruto seco"],
        "congelado": ["pizza", "croqueta", "helado"],
        "salsa": ["ketchup", "mayonesa", "tomate frito"],
        "aceite": ["oliva", "girasol"],
        "dulce": ["chocolate", "mermelada", "natillas"]
    };

    // ------------------ SUBCATEGORÍAS ------------------
    const subcategorias = {
        lacteos: ["leche", "lácteo", "dairy", "yogur", "yogurt", "queso", "cheese", "mantequilla", "butter", "natillas"],
        carnes: ["pollo", "chicken", "ternera", "beef", "cerdo", "pork", "jamón", "ham", "salchicha", "sausage", "meat", "carne"],
        pescados: ["merluza", "salmón", "salmon", "atún", "tuna", "gambas", "shrimp", "fish", "pescado"],
        panaderia: ["pan", "bread", "baguette", "croissant", "magdalena", "muffin", "pastry", "bakery", "bollería"],
        snacks: ["snack", "galleta", "cookie", "patata", "chips", "palomita", "popcorn", "fruto seco", "nuts", "cracker"],
        bebidas: ["agua", "water", "zumo", "juice", "refresco", "soda", "cerveza", "beer", "vino", "wine", "drink", "bebida"],
        cafe_te: ["café", "coffee", "té", "tea", "cápsula", "capsule", "infusión"],
        cereales: ["arroz", "rice", "pasta", "espagueti", "spaghetti", "macarrón", "macaroni", "cereal", "noodles"],
        frutas_verduras: ["manzana", "apple", "plátano", "banana", "naranja", "orange", "tomate", "tomato", "lechuga", "lettuce", "fruta", "fruit", "verdura", "vegetable"],
        congelados: ["congelado", "frozen", "pizza", "croqueta", "helado", "ice cream"],
        salsas: ["salsa", "sauce", "ketchup", "mayonesa", "mayonnaise", "tomate frito"],
        aceites: ["aceite", "oil", "oliva", "olive", "girasol", "sunflower"],
        dulces: ["chocolate", "mermelada", "jam", "dulce", "sweet", "natillas", "custard"]
    };

    function detectarCategoria(prod) {
        const cat = (prod.category || "").toLowerCase();
        if (subcategorias[cat]) return cat;
        const texto = (prod.title + " " + prod.description).toLowerCase();
        for (const [c, claves] of Object.entries(subcategorias)) {
            if (claves.some(k => texto.includes(k))) return c;
        }
        return "otros";
    }

    // ------------------ CARGA PRODUCTOS ------------------
    async function cargarProductos() {
        try {
            const res = await fetch("api.php", { credentials: "include" });
            const data = await res.json();

            productosBase = (data.products || []).map(p => ({ ...p, id: Number(p.id) }));
            productos = [...productosBase];
            cargarSubcategoriasSelect();
            filtrarYPrepararRender();

            // Comprobar sesión DESPUÉS de tener los productos (para poder cargar carrito del servidor)
            await comprobarSesion();

            setTimeout(() => {
                const splash = document.getElementById("splashScreen");
                if (splash) splash.classList.add("oculto");
            }, 1800);

        } catch (error) {
            console.error("Error cargando productos:", error);
            resultados.innerHTML = "<p>Error al cargar los productos.</p>";
            const splash = document.getElementById("splashScreen");
            if (splash) splash.classList.add("oculto");
        }
    }

    cargarProductos();

    // ------------------ LEVENSHTEIN ------------------
    function levenshtein(a, b) {
        const m = [];
        for (let i = 0; i <= b.length; i++) m[i] = [i];
        for (let j = 0; j <= a.length; j++) m[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                m[i][j] = b[i - 1] === a[j - 1]
                    ? m[i - 1][j - 1]
                    : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
            }
        }
        return m[b.length][a.length];
    }

    function corregirPalabra(p) {
        let mejor = p, mejorDist = 99;
        for (const k of Object.keys(sinonimos)) {
            const d = levenshtein(p, k);
            if (d < mejorDist && d <= 2) { mejorDist = d; mejor = k; }
        }
        return mejor;
    }

    function expandirTerminos(texto) {
        texto = texto.toLowerCase().trim();
        const corregida = corregirPalabra(texto);
        const terminos = new Set([texto, corregida]);
        (sinonimos[corregida] || []).forEach(t => terminos.add(t));
        Object.values(subcategorias).forEach(claves => {
            claves.forEach(c => { if (levenshtein(c, texto) <= 2) terminos.add(c); });
        });
        return [...terminos];
    }

    function cargarSubcategoriasSelect() {
        const labels = {
            lacteos: "Lácteos", carnes: "Carnes", pescados: "Pescados",
            panaderia: "Panadería", snacks: "Snacks", bebidas: "Bebidas",
            cafe_te: "Café y Té", cereales: "Cereales, Pasta y Arroz",
            frutas_verduras: "Frutas y Verduras", congelados: "Congelados",
            salsas: "Salsas", aceites: "Aceites", dulces: "Dulces"
        };
        filtroCategoria.innerHTML = `<option value="">Todas</option>`;
        Object.entries(labels).forEach(([val, texto]) => {
            const op = document.createElement("option");
            op.value = val; op.textContent = texto;
            filtroCategoria.appendChild(op);
        });
    }

    function calcularPreciosSupermercados(prod) {
        if (prod.preciosFijos) {
            const normalizados = {};
            const noDisp = prod.noDisponible || [];
            for (const [super_, precio] of Object.entries(prod.preciosFijos)) {
                normalizados[super_] = noDisp.includes(super_) ? "N/D" : String(precio).replace(",", ".");
            }
            return normalizados;
        }
        if (preciosPersistentes[prod.id]) return preciosPersistentes[prod.id];
        const variacion = {
            Mercadona: 0.95 + Math.random() * 0.15,
            Carrefour:  0.90 + Math.random() * 0.20,
            Dia:        0.92 + Math.random() * 0.18,
            Lidl:       0.93 + Math.random() * 0.17
        };
        const precios = {
            Mercadona: (prod.price * variacion.Mercadona).toFixed(2),
            Carrefour: (prod.price * variacion.Carrefour).toFixed(2),
            Dia:       (prod.price * variacion.Dia).toFixed(2),
            Lidl:      (prod.price * variacion.Lidl).toFixed(2)
        };
        preciosPersistentes[prod.id] = precios;
        guardarPrecios(preciosPersistentes);
        return precios;
    }

    function supermercadoMasBarato(precios) {
        let mejor = null, mejorPrecio = Infinity;
        for (const [superm, precio] of Object.entries(precios)) {
            const p = parseFloat(precio);
            if (p < mejorPrecio) { mejorPrecio = p; mejor = superm; }
        }
        return mejor;
    }

    // ------------------ AUTOCOMPLETADO ------------------
    function actualizarSugerencias(termino) {
        suggestionsBox.innerHTML = "";
        if (!termino || termino.length < 2) { suggestionsBox.style.display = "none"; return; }
        const matches = productosBase.map(p => p.title).filter(t => t.toLowerCase().includes(termino)).slice(0, 8);
        if (!matches.length) { suggestionsBox.style.display = "none"; return; }
        matches.forEach(t => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = t;
            div.onclick = () => {
                input.value = t;
                suggestionsBox.style.display = "none";
                input.dispatchEvent(new Event("input"));
            };
            suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = "block";
    }

    document.addEventListener("click", e => {
        if (!suggestionsBox.contains(e.target) && e.target !== input) suggestionsBox.style.display = "none";
    });

    function buscarEnLocal(texto) {
        const terminos = expandirTerminos(texto);
        return productosBase.filter(p => {
            const haystack = (p.title + " " + p.description + " " + (p.category || "")).toLowerCase();
            return terminos.some(t => haystack.includes(t));
        });
    }

    input.addEventListener("input", () => {
        const texto = input.value.trim().toLowerCase();
        if (texto.length < 2) {
            productos = [...productosBase];
            tituloResultados.textContent = "Resultados";
            filtrarYPrepararRender();
            suggestionsBox.style.display = "none";
            return;
        }
        actualizarSugerencias(texto);
        productos = buscarEnLocal(texto);
        tituloResultados.textContent = `Resultados para "${input.value.trim()}"`;
        filtrarYPrepararRender();
    });

    const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
    [filtroCategoria, filtroSuper, filtroPrecioMin, filtroPrecioMax, filtroOrden].forEach(el => {
        el.addEventListener("change", () => btnAplicarFiltros.classList.add("pendiente"));
        el.addEventListener("input",  () => btnAplicarFiltros.classList.add("pendiente"));
    });
    btnAplicarFiltros.addEventListener("click", () => {
        btnAplicarFiltros.classList.remove("pendiente");
        filtrarYPrepararRender();
    });

    function filtrarYPrepararRender() {
        const catSel    = filtroCategoria.value;
        const precioMin = parseFloat(filtroPrecioMin.value);
        const precioMax = parseFloat(filtroPrecioMax.value);
        const superSel  = filtroSuper.value;
        const orden     = filtroOrden.value;

        productosFiltrados = productos.filter(p => {
            if (catSel && detectarCategoria(p) !== catSel) return false;
            const precios = calcularPreciosSupermercados(p);
            const preciosValidos = Object.values(precios).map(v => parseFloat(v)).filter(v => !isNaN(v));
            const minP = Math.min(...preciosValidos);
            const maxP = Math.max(...preciosValidos);
            if (!isNaN(precioMin) && maxP < precioMin) return false;
            if (!isNaN(precioMax) && minP > precioMax) return false;
            if (superSel) {
                const pSuper = parseFloat(precios[superSel]);
                if (isNaN(pSuper)) return false;
                const esMinimo = preciosValidos.every(v => pSuper <= v);
                if (!esMinimo) return false;
            }
            return true;
        });

        if (orden === "precio-asc") {
            productosFiltrados.sort((a, b) => {
                const pa = Math.min(...Object.values(calcularPreciosSupermercados(a)).map(parseFloat).filter(v => !isNaN(v)));
                const pb = Math.min(...Object.values(calcularPreciosSupermercados(b)).map(parseFloat).filter(v => !isNaN(v)));
                return pa - pb;
            });
        } else if (orden === "precio-desc") {
            productosFiltrados.sort((a, b) => {
                const pa = Math.min(...Object.values(calcularPreciosSupermercados(a)).map(parseFloat).filter(v => !isNaN(v)));
                const pb = Math.min(...Object.values(calcularPreciosSupermercados(b)).map(parseFloat).filter(v => !isNaN(v)));
                return pb - pa;
            });
        } else if (orden === "nombre-asc") {
            productosFiltrados.sort((a, b) => a.title.localeCompare(b.title));
        } else if (orden === "nombre-desc") {
            productosFiltrados.sort((a, b) => b.title.localeCompare(a.title));
        }

        renderCount = 0;
        resultados.innerHTML = "";
        renderMas();
    }

    function renderMas() {
        if (renderCount >= productosFiltrados.length) return;
        const slice = productosFiltrados.slice(renderCount, renderCount + PAGE_SIZE);

        slice.forEach(prod => {
            const precios = calcularPreciosSupermercados(prod);
            const preciosEntries = Object.entries(precios);
            const minPrecio = Math.min(...preciosEntries.map(([_, v]) => parseFloat(v)));
            const esFav = esFavorito(prod.id);

            const div = document.createElement("div");
            div.classList.add("producto-card");
            div.innerHTML = `
                <div class="producto-header">
                    <div class="producto-tags">
                        <span class="tag-categoria">${detectarCategoria(prod)}</span>
                        ${prod.allergens && prod.allergens.length ? `<span class="tag-alergenos">⚠ ${prod.allergens.length} alérg.</span>` : ""}
                    </div>
                    <img src="${prod.thumbnail}" class="producto-img" onerror="this.src='img/logo2.png'">
                </div>
                <div class="supermercados">
                    ${preciosEntries.map(([supermercado, precio]) => `
                        <div class="supermercado ${parseFloat(precio) === minPrecio ? "mejor" : ""}">
                            <span>${supermercado}</span>
                            <span class="precio">${precio}€</span>
                        </div>
                    `).join("")}
                </div>
                <button class="btn-add-carrito" data-id="${prod.id}">Añadir al carrito</button>
                <div class="fav-icon ${esFav ? "filled" : ""}" data-id="${prod.id}">
                    ${esFav ? "♥" : "♡"}
                </div>
            `;

            div.addEventListener("click", (e) => {
                if (e.target.closest(".btn-add-carrito") || e.target.closest(".fav-icon")) return;
                const ripple = document.createElement("span");
                ripple.classList.add("ripple");
                const rect = div.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                div.appendChild(ripple);
                ripple.addEventListener("animationend", () => ripple.remove());
                abrirProductoModal(prod.id);
            });

            resultados.appendChild(div);
        });

        renderCount += slice.length;
        wireFavoritos();
        wireCarritoBotones();

        setTimeout(() => {
            if (document.body.scrollHeight <= window.innerHeight) renderMas();
        }, 0);
    }

    function wireFavoritos() {
        document.querySelectorAll(".fav-icon").forEach(icon => {
            icon.onclick = async () => {
                const id = parseInt(icon.dataset.id);
                await toggleFavorito(id);
                // Si hay sesión, actualizar icono tras respuesta del servidor
                if (usuarioActual) {
                    const esFav = esFavorito(id);
                    icon.textContent = esFav ? "♥" : "♡";
                    icon.classList.toggle("filled", esFav);
                    icon.classList.remove("pop");
                    void icon.offsetWidth;
                    icon.classList.add("pop");
                    icon.addEventListener("animationend", () => icon.classList.remove("pop"), { once: true });
                }
                // Si no hay sesión se habrá abierto el modal de login,
                // el icono se actualiza en la acción pendiente tras login.
            };
        });
    }

    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) renderMas();
    });

    // ------------------ VOLVER ARRIBA ------------------
    const volverArriba = document.getElementById("volverArriba");
    window.addEventListener("scroll", () => volverArriba.classList.toggle("visible", window.scrollY > 400));
    volverArriba.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // ------------------ PARALLAX HEADER ------------------
    window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        header.classList.toggle("scrolled", window.scrollY > 10);
        header.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    });

    // ------------------ TEMA ------------------
    favToggle.innerHTML  = `<span class="material-symbols-rounded">favorite</span>`;
    cartToggle.innerHTML = `<span class="material-symbols-rounded">shopping_cart</span><span id="cartCount" class="cart-count">0</span>`;
    darkToggle.innerHTML = `<span class="material-symbols-rounded">dark_mode</span>`;

    function aplicarTema() {
        const dark = localStorage.getItem(THEME_KEY) === "dark";
        document.body.classList.add("tema-cambiando");
        document.body.classList.toggle("dark", dark);
        document.body.classList.toggle("light", !dark);
        darkToggle.innerHTML = `<span class="material-symbols-rounded">${dark ? "light_mode" : "dark_mode"}</span>`;
        setTimeout(() => document.body.classList.remove("tema-cambiando"), 400);
    }

    darkToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem(THEME_KEY, isDark ? "light" : "dark");
        aplicarTema();
    });
    aplicarTema();

    // ------------------ FAVORITOS TOGGLE ------------------
    let modoFavoritos = false;
    favToggle.addEventListener("click", () => {
        modoFavoritos = !modoFavoritos;
        favToggle.classList.toggle("btn-active", modoFavoritos);
        if (modoFavoritos) {
            const favs = getFavoritos();
            productos = productosBase.filter(p => favs.includes(p.id));
            tituloResultados.textContent = "Favoritos";
        } else {
            productos = [...productosBase];
            tituloResultados.textContent = "Resultados";
        }
        filtrarYPrepararRender();
    });

    // ------------------ CARRITO ------------------
    function actualizarContadorCarrito() {
        const count = document.getElementById("cartCount");
        if (count) count.textContent = carrito.length;
    }

    function wireCarritoBotones() {
        document.querySelectorAll(".btn-add-carrito").forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.id);
                const prod = productosBase.find(p => p.id === id);
                if (prod) await agregarAlCarrito(prod);
            };
        });
    }

    // ============================================================
    // COMPARTIR CARRITO (sin cambios)
    // ============================================================
    function codificarCarrito(incluirCantidades = true, incluirPrecios = true) {
        if (!carrito.length) return "";
        const agrupado = [];
        carrito.forEach(p => {
            const existente = agrupado.find(a => a.id === p.id);
            if (existente) existente.cantidad++;
            else agrupado.push({ ...p, cantidad: 1 });
        });
        const datos = agrupado.map(p => {
            const item = { id: p.id, title: p.title };
            if (incluirCantidades) item.cant = p.cantidad;
            if (incluirPrecios) {
                const precios = calcularPreciosSupermercados(p);
                item.precios = {
                    M: parseFloat(precios.Mercadona).toFixed(2),
                    C: parseFloat(precios.Carrefour).toFixed(2),
                    D: parseFloat(precios.Dia).toFixed(2),
                    L: parseFloat(precios.Lidl).toFixed(2)
                };
            }
            return item;
        });
        return btoa(encodeURIComponent(JSON.stringify(datos)));
    }

    function decodificarCarrito(codigo) {
        try { return JSON.parse(decodeURIComponent(atob(codigo))); }
        catch { return null; }
    }

    function generarLinkCompartir(incluirCantidades = true, incluirPrecios = true) {
        const codigo = codificarCarrito(incluirCantidades, incluirPrecios);
        if (!codigo) return "";
        return window.location.origin + window.location.pathname + "?carrito=" + codigo;
    }

    function abrirCompartirModal() {
        const modal = document.getElementById("compartirModal");
        const linkInput = document.getElementById("compartirLink");
        const incluirCantidades = document.getElementById("incluirCantidades");
        const incluirPrecios = document.getElementById("incluirPrecios");
        function actualizarLink() {
            linkInput.value = generarLinkCompartir(incluirCantidades.checked, incluirPrecios.checked);
        }
        actualizarLink();
        incluirCantidades.onchange = actualizarLink;
        incluirPrecios.onchange = actualizarLink;
        document.getElementById("btnCopiarLink").onclick = () => {
            linkInput.select();
            document.execCommand("copy");
            const btn = document.getElementById("btnCopiarLink");
            const textoOriginal = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-rounded">check</span> ¡Copiado!';
            setTimeout(() => { btn.innerHTML = textoOriginal; }, 2000);
        };
        document.querySelector(".compartir-modal-close").onclick  = cerrarCompartirModal;
        document.querySelector(".compartir-modal-overlay").onclick = cerrarCompartirModal;
        modal.classList.remove("hidden");
    }

    function cerrarCompartirModal() {
        document.getElementById("compartirModal").classList.add("hidden");
    }

    function cargarCarritoDesdeLink() {
        const params = new URLSearchParams(window.location.search);
        const codigo = params.get("carrito");
        if (codigo) {
            const items = decodificarCarrito(codigo);
            if (items && Array.isArray(items)) {
                carrito = [];
                items.forEach(item => {
                    const prod = productosBase.find(p => p.id === item.id);
                    if (prod) {
                        const cantidad = item.cant || 1;
                        for (let i = 0; i < cantidad; i++) carrito.push(prod);
                    }
                });
                localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
                mostrarNotificacion(`✓ Carrito cargado (${carrito.length} productos)`);
                window.history.replaceState({}, document.title, window.location.pathname);
                renderCarrito();
            }
        }
    }

    function renderCarrito() {
        if (!carrito.length) {
            carritoPanel.innerHTML = `<h2>🛒 Carrito vacío</h2>`;
            actualizarContadorCarrito();
            return;
        }

        const agrupado = [];
        carrito.forEach(p => {
            const existente = agrupado.find(a => a.id === p.id);
            if (existente) existente.cantidad++;
            else agrupado.push({ ...p, cantidad: 1 });
        });

        const totales = { Mercadona: 0, Carrefour: 0, Dia: 0, Lidl: 0 };
        agrupado.forEach(p => {
            const precios = calcularPreciosSupermercados(p);
            Object.keys(totales).forEach(s => totales[s] += parseFloat(precios[s]) * p.cantidad);
        });

        const mejor = Object.entries(totales).reduce((a, b) => a[1] < b[1] ? a : b);

        carritoPanel.innerHTML = `
            <h2>🛒 Carrito</h2>
            ${agrupado.map(p => `
                <div class="carrito-item" data-id="${p.id}">
                    <img src="${p.thumbnail}" onerror="this.src='img/logo2.png'">
                    <div class="info">
                        <div class="nombre">${p.title}</div>
                        <div class="cantidad-control">
                            <button class="cantidad-btn menos" data-id="${p.id}">−</button>
                            <span class="cantidad-valor">${p.cantidad}</span>
                            <button class="cantidad-btn mas" data-id="${p.id}">+</button>
                        </div>
                    </div>
                    <div class="eliminar">✕</div>
                </div>
            `).join("")}
            <hr>
            ${Object.entries(totales).map(([s, v]) => `<p>${s}: <strong>${v.toFixed(2)}€</strong></p>`).join("")}
            <p class="mejor">🥇 Más barato: ${mejor[0]} (${mejor[1].toFixed(2)}€)</p>
            <button id="vaciarCarrito" class="btn-primary">Vaciar carrito</button>
            <button id="compartirCarrito" class="btn-secondary" style="display:flex;align-items:center;gap:6px;justify-content:center;margin-top:8px;">
                <span class="material-symbols-rounded" style="font-size:18px;">share</span> Compartir carrito
            </button>
            <button id="exportarPDF" class="btn-secondary" style="display:flex;align-items:center;gap:6px;justify-content:center;margin-top:8px;">
                <span class="material-symbols-rounded" style="font-size:18px;">picture_as_pdf</span> Exportar PDF
            </button>
        `;

        actualizarContadorCarrito();

        document.getElementById("vaciarCarrito").onclick = async () => {
            carrito = [];
            localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
            // Si hay sesión, sincronizar vaciado (borrando y re-sincronizando con array vacío)
            if (usuarioActual) {
                try {
                    // Eliminar cada producto del carrito en servidor
                    const agr = [...agrupado];
                    for (const item of agr) {
                        await fetch("api.php", {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ accion: "carrito_remove", producto_id: item.id })
                        });
                    }
                } catch (e) { console.warn("Error vaciando carrito servidor:", e); }
            }
            renderCarrito();
        };

        document.getElementById("compartirCarrito").onclick = abrirCompartirModal;

        document.querySelectorAll(".cantidad-btn.menos").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                const idx = carrito.findLastIndex(p => p.id === id);
                if (idx !== -1) carrito.splice(idx, 1);
                localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
                if (usuarioActual) {
                    const nueva = carrito.filter(p => p.id === id).length;
                    try {
                        if (nueva === 0) {
                            await fetch("api.php", {
                                method: "POST", credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ accion: "carrito_remove", producto_id: id })
                            });
                        } else {
                            await fetch("api.php", {
                                method: "POST", credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ accion: "carrito_cantidad", producto_id: id, cantidad: nueva })
                            });
                        }
                    } catch (e) { console.warn("Error actualizando cantidad:", e); }
                }
                renderCarrito();
            };
        });

        document.querySelectorAll(".cantidad-btn.mas").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                const prod = productosBase.find(p => p.id === id);
                if (prod) await agregarAlCarrito(prod);
            };
        });

        document.querySelectorAll(".eliminar").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.closest(".carrito-item").dataset.id);
                carrito = carrito.filter(p => p.id !== id);
                localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
                if (usuarioActual) {
                    try {
                        await fetch("api.php", {
                            method: "POST", credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ accion: "carrito_remove", producto_id: id })
                        });
                    } catch (e) { console.warn("Error eliminando del carrito servidor:", e); }
                }
                renderCarrito();
            };
        });

        // Exportar PDF (sin cambios)
        document.getElementById("exportarPDF").onclick = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const fecha = new Date().toLocaleDateString("es-ES");
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const VERDE_OSCURO  = [47, 62, 51];
            const VERDE_ACENTO  = [111, 143, 114];
            const VERDE_HEADER  = [61, 74, 63];
            const VERDE_CLARO   = [238, 242, 236];
            const VERDE_STRIPE  = [231, 237, 229];
            const BLANCO        = [255, 255, 255];
            const MUTED         = [124, 139, 126];
            const superColors = {
                Mercadona: [0, 110, 60], Carrefour: [0, 70, 160],
                Dia: [200, 30, 30], Lidl: [220, 160, 0]
            };
            const img = new Image();
            img.src = "img/logo2.png";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                const logoBase64 = canvas.toDataURL("image/png");
                doc.setFillColor(...VERDE_HEADER); doc.rect(0, 0, pageW, 44, "F");
                doc.setFillColor(...VERDE_ACENTO); doc.rect(0, 0, 4, 44, "F");
                doc.addImage(logoBase64, "PNG", 10, 8, 24, 24);
                doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(...BLANCO);
                doc.text("PRECIOSYA", 40, 22);
                doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...VERDE_ACENTO);
                doc.text("Comparador de precios · Uso académico", 40, 30);
                doc.setFontSize(8); doc.setTextColor(...VERDE_CLARO);
                doc.text(`Generado el ${fecha}`, pageW - 12, 38, { align: "right" });
                let y = 54;
                doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...VERDE_OSCURO);
                doc.text("LISTA DE LA COMPRA", 14, y);
                doc.setDrawColor(...VERDE_ACENTO); doc.setLineWidth(0.8); doc.line(14, y + 3, 80, y + 3);
                y += 12;
                doc.setFillColor(...VERDE_HEADER); doc.rect(10, y - 5, pageW - 20, 10, "F");
                doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLANCO);
                doc.text("#", 14, y); doc.text("PRODUCTO", 22, y); doc.text("CANT.", 110, y);
                doc.text("MEJOR PRECIO", 125, y); doc.text("TOTAL", 178, y); y += 8;
                doc.setLineWidth(0.1);
                agrupado.forEach((p, i) => {
                    const precios = calcularPreciosSupermercados(p);
                    const mejorProd = supermercadoMasBarato(precios);
                    const precioMejor = parseFloat(precios[mejorProd]).toFixed(2);
                    const totalLinea = (parseFloat(precios[mejorProd]) * p.cantidad).toFixed(2);
                    doc.setFillColor(...(i % 2 === 0 ? VERDE_CLARO : BLANCO));
                    doc.rect(10, y - 4, pageW - 20, 9, "F");
                    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...VERDE_ACENTO);
                    doc.text(`${i + 1}`, 14, y);
                    doc.setFont("helvetica", "normal"); doc.setTextColor(...VERDE_OSCURO);
                    const titulo = p.title.length > 38 ? p.title.substring(0, 36) + "…" : p.title;
                    doc.text(titulo, 22, y);
                    doc.setFont("helvetica", "bold"); doc.setFillColor(...VERDE_ACENTO);
                    doc.roundedRect(108, y - 3.5, 12, 5, 1, 1, "F");
                    doc.setTextColor(...BLANCO); doc.setFontSize(7);
                    doc.text(`x${p.cantidad}`, 114, y, { align: "center" });
                    const sc = superColors[mejorProd] || VERDE_OSCURO;
                    doc.setFillColor(...sc); doc.roundedRect(123, y - 3.5, 2.5, 5, 0.5, 0.5, "F");
                    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...sc);
                    doc.text(mejorProd, 128, y);
                    doc.setFont("helvetica", "bold"); doc.setTextColor(...VERDE_OSCURO);
                    doc.text(`${totalLinea}€`, 178, y);
                    doc.setDrawColor(...VERDE_STRIPE); doc.line(10, y + 4, pageW - 10, y + 4);
                    y += 10;
                    if (y > 262) {
                        doc.addPage(); y = 20;
                        doc.setFillColor(...VERDE_HEADER); doc.rect(10, y - 5, pageW - 20, 10, "F");
                        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLANCO);
                        doc.text("#", 14, y); doc.text("PRODUCTO", 22, y); doc.text("CANT.", 110, y);
                        doc.text("MEJOR PRECIO", 125, y); doc.text("TOTAL", 178, y); y += 8;
                    }
                });
                y += 6;
                doc.setFillColor(...VERDE_CLARO); doc.rect(10, y - 5, pageW - 20, 10, "F");
                doc.setDrawColor(...VERDE_ACENTO); doc.setLineWidth(0.5); doc.line(10, y - 5, 10, y + 5);
                doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...VERDE_OSCURO);
                doc.text("RESUMEN POR SUPERMERCADO", 15, y); y += 12;
                Object.entries(totales).forEach(([super_, total]) => {
                    const sc = superColors[super_] || [80, 80, 80];
                    const esMejor = super_ === mejor[0];
                    if (esMejor) { doc.setFillColor(...VERDE_CLARO); doc.rect(10, y - 4, pageW - 20, 9, "F"); }
                    doc.setFillColor(...sc); doc.rect(10, y - 4, 4, 9, "F");
                    doc.setFont("helvetica", esMejor ? "bold" : "normal"); doc.setFontSize(10); doc.setTextColor(...VERDE_OSCURO);
                    doc.text(super_, 18, y);
                    doc.setFont("helvetica", "bold"); doc.setTextColor(...(esMejor ? VERDE_ACENTO : VERDE_OSCURO));
                    doc.text(`${total.toFixed(2)}€`, 80, y);
                    if (esMejor) {
                        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...BLANCO);
                        doc.setFillColor(...VERDE_ACENTO); doc.roundedRect(95, y - 3.5, 22, 5, 1, 1, "F");
                        doc.text("MAS BARATO", 106, y, { align: "center" });
                    }
                    y += 10;
                });
                y += 4;
                doc.setFillColor(...VERDE_HEADER); doc.roundedRect(10, y, pageW - 20, 18, 3, 3, "F");
                doc.setFillColor(...VERDE_ACENTO); doc.roundedRect(10, y, 5, 18, 2, 2, "F");
                doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(...BLANCO);
                doc.text(`Comprar en ${mejor[0]} te sale por ${mejor[1].toFixed(2)}€`, 20, y + 11);
                const masCaro = Object.entries(totales).reduce((a, b) => a[1] > b[1] ? a : b);
                const ahorro = (masCaro[1] - mejor[1]).toFixed(2);
                doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...VERDE_ACENTO);
                doc.text(`Ahorro vs ${masCaro[0]}: ${ahorro}€`, pageW - 14, y + 11, { align: "right" });
                y += 26;
                doc.setFillColor(...VERDE_CLARO); doc.roundedRect(10, y, pageW - 20, 32, 3, 3, "F");
                doc.setDrawColor(...VERDE_ACENTO); doc.setLineWidth(0.3); doc.roundedRect(10, y, pageW - 20, 32, 3, 3, "S");
                doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...VERDE_OSCURO);
                doc.text("Resumen de tu compra", 16, y + 9);
                doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
                doc.text(`Total de productos: ${agrupado.length} referencias · ${carrito.length} unidades`, 16, y + 17);
                doc.text(`Supermercado recomendado: ${mejor[0]} · Total: ${mejor[1].toFixed(2)}€`, 16, y + 24);
                doc.setDrawColor(...VERDE_ACENTO); doc.setLineWidth(0.3); doc.line(pageW / 2, y + 4, pageW / 2, y + 28);
                doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...VERDE_OSCURO);
                doc.text("Ahorro estimado", pageW / 2 + 6, y + 9);
                doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...VERDE_ACENTO);
                doc.text(`${ahorro}€`, pageW / 2 + 6, y + 24);
                doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...MUTED);
                doc.text(`vs ${masCaro[0]} (${masCaro[1].toFixed(2)}€)`, pageW - 14, y + 24, { align: "right" });
                doc.setFillColor(...VERDE_HEADER); doc.rect(0, pageH - 16, pageW, 16, "F");
                doc.setFillColor(...VERDE_ACENTO); doc.rect(0, pageH - 16, pageW, 1.5, "F");
                doc.addImage(logoBase64, "PNG", 12, pageH - 13, 8, 8);
                doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLANCO);
                doc.text("PRECIOSYA", 23, pageH - 7);
                doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(...VERDE_ACENTO);
                doc.text("Precios simulados con fines educativos. No reflejan precios reales.", pageW / 2, pageH - 7, { align: "center" });
                doc.setTextColor(...MUTED);
                doc.save(`preciosya-carrito-${fecha.replace(/\//g, "-")}.pdf`);
            };
        };
    }

    cartToggle.addEventListener("click", () => {
        renderCarrito();
        carritoPanel.classList.toggle("visible");
    });
    actualizarContadorCarrito();

    // ------------------ MENÚ HAMBURGUESA ------------------
    const menuToggle  = document.getElementById("menuToggle");
    const menuPanel   = document.getElementById("menuPanel");
    const menuOverlay = document.getElementById("menuOverlay");
    const menuClose   = document.getElementById("menuClose");

function abrirMenu() {
    actualizarMenuHamburguesa(); // ← AÑADE ESTA LÍNEA
    menuPanel.classList.add("visible");
    menuOverlay.classList.add("visible");
    document.body.style.overflow = "hidden";
}    function cerrarMenu() { menuPanel.classList.remove("visible"); menuOverlay.classList.remove("visible"); document.body.style.overflow = ""; }

    menuToggle.addEventListener("click", abrirMenu);
    menuClose.addEventListener("click", cerrarMenu);
    menuOverlay.addEventListener("click", cerrarMenu);

    // ------------------ MODALES DE INFORMACIÓN ------------------
    const contenidoModales = {
        "como-funciona": {
            titulo: "Cómo funciona",
            cuerpo: `<p>PRECIOSYA es un comparador de precios que te permite ver el precio de un mismo producto en los principales supermercados españoles.</p><h3>Busca un producto</h3><p>Usa la barra de búsqueda para encontrar lo que necesitas. El buscador entiende sinónimos y corrige errores tipográficos.</p><h3>Compara precios</h3><p>Cada tarjeta muestra el precio en Mercadona, Carrefour, Dia y Lidl. El precio más barato se resalta en verde.</p><h3>Usa el carrito</h3><p>Añade productos al carrito para ver en qué supermercado te sale más barato hacer la compra completa.</p><h3>Filtra y ordena</h3><p>Usa los filtros de categoría, supermercado y precio para encontrar exactamente lo que buscas.</p>`
        },
        "privacidad": {
            titulo: "Política de privacidad",
            cuerpo: `<p>Este proyecto es de carácter académico.</p><h3>Datos de cuenta</h3><p>Si creas una cuenta, tu email y contraseña (hasheada) se guardan en la base de datos local de XAMPP. No se comparten con terceros.</p><h3>Datos locales</h3><p>El tema y preferencias de vista se guardan en localStorage de tu navegador.</p><h3>Sin cookies de seguimiento</h3><p>No utilizamos cookies de seguimiento ni herramientas de analítica de terceros.</p>`
        },
        "terminos": {
            titulo: "Términos de uso",
            cuerpo: `<p>Al usar PRECIOSYA aceptas los siguientes términos:</p><h3>Uso permitido</h3><p>Este sitio es exclusivamente para uso educativo y académico. No está permitido su uso comercial.</p><h3>Datos</h3><p>Los precios mostrados son simulados y no deben usarse como referencia real de precios en ningún supermercado.</p><h3>Propiedad intelectual</h3><p>El código y diseño de PRECIOSYA es un proyecto académico. Las marcas de los supermercados pertenecen a sus respectivos propietarios.</p>`
        },
        "contacto": {
            titulo: "Contacto",
            cuerpo: `<div style="position:relative;"><div id="iframeLoader" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-size:13px;color:var(--muted);height:200px;"><span class="material-symbols-rounded" style="font-size:36px;color:var(--accent);">hourglass_empty</span>Cargando formulario...</div><iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfyoyKOTCV8lPZOYI1aKf4bmTEjV2osjjsT4Z7PrG6-lXjMAg/viewform?embedded=true" width="100%" height="900" frameborder="0" marginheight="0" marginwidth="0" style="display:block;opacity:0;transition:opacity 0.3s ease;" onload="this.style.opacity='1';const loader=document.getElementById('iframeLoader');if(loader)loader.style.display='none';">Cargando…</iframe></div>`
        }
    };

    window.abrirModal = (tipo) => {
        const modal = document.getElementById("infoModal");
        const titulo = document.getElementById("infoModalTitle");
        const cuerpo = document.getElementById("infoModalBody");
        const contenido = contenidoModales[tipo];
        if (!contenido) return;
        titulo.textContent = contenido.titulo;
        cuerpo.innerHTML = contenido.cuerpo;
        modal.classList.remove("hidden");
        cerrarMenu();
    };

    window.cerrarModal = () => { document.getElementById("infoModal").classList.add("hidden"); };

    document.getElementById("infoModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("infoModal")) cerrarModal();
    });

    // ------------------ MODAL DETALLE PRODUCTO ------------------
    window.abrirProductoModal = (id) => {
        const prod = productosFiltrados.find(p => p.id === id) || productosBase.find(p => p.id === id);
        if (!prod) return;

        const precios = calcularPreciosSupermercados(prod);
        const preciosEntries = Object.entries(precios);
        const minPrecio = Math.min(...preciosEntries.map(([_, v]) => parseFloat(v)));
        const mejor = supermercadoMasBarato(precios);
        const categoria = detectarCategoria(prod);

        document.getElementById("modalImg").src = prod.thumbnail;
        document.getElementById("modalImg").onerror = () => document.getElementById("modalImg").src = "img/logo2.png";
        document.getElementById("modalCategoria").textContent = categoria;
        document.getElementById("modalNombre").textContent = prod.title;
        document.getElementById("modalDesc").textContent = prod.description || "Sin descripción disponible.";

        const allergenSymbols = {
            "gluten": { symbol: "🌾", name: "Gluten" },
            "lacteos": { symbol: "🥛", name: "Lácteos" },
            "huevos": { symbol: "🥚", name: "Huevos" },
            "pescado": { symbol: "🐟", name: "Pescado" },
            "frutos_secos": { symbol: "🥜", name: "Frutos secos" }
        };

        const allergensContainer = document.getElementById("modalAllergens");
        const allergensSection   = document.getElementById("modalAllergensSection");
        if (prod.allergens && prod.allergens.length > 0) {
            allergensContainer.innerHTML = prod.allergens.map(alg => {
                const info = allergenSymbols[alg];
                if (!info) return '';
                return `<div class="allergen-badge" title="${info.name}"><span class="allergen-symbol">${info.symbol}</span><span class="allergen-name">${info.name}</span></div>`;
            }).join('');
            allergensSection.style.display = 'block';
        } else {
            allergensContainer.innerHTML = '<span style="color:var(--muted);font-size:12px;">Sin alérgenos declarados</span>';
            allergensSection.style.display = 'block';
        }

        document.getElementById("modalPrecios").innerHTML = preciosEntries.map(([super_, precio]) => `
            <div class="modal-precio-item ${parseFloat(precio) === minPrecio ? "mejor" : ""}">
                <span class="super-nombre">${super_}</span>
                <span class="super-precio">${precio}€</span>
            </div>
        `).join("");

        document.getElementById("modalMejor").textContent = `${mejor} — ${parseFloat(precios[mejor]).toFixed(2)}€`;

        // Botón carrito del modal
        document.getElementById("modalBtnCarrito").onclick = async () => {
            await agregarAlCarrito(prod);
            if (usuarioActual) cerrarProductoModal();
        };

        // Botón favorito del modal
        const btnFav = document.getElementById("modalBtnFav");
        const actualizarBtnFav = () => {
            const esFav = esFavorito(prod.id);
            btnFav.innerHTML = `<span class="material-symbols-rounded">${esFav ? "heart_minus" : "favorite"}</span> ${esFav ? "Quitar de favoritos" : "Añadir a favoritos"}`;
            btnFav.classList.toggle("activo", esFav);
        };
        actualizarBtnFav();
        btnFav.onclick = async () => {
            await toggleFavorito(prod.id);
            if (usuarioActual) actualizarBtnFav();
        };

        // Botón compartir
        document.getElementById("modalBtnCompartir").onclick = () => {
            const precioMejor = parseFloat(precios[mejor]).toFixed(2);
            const texto = `🛒 ${prod.title}\n🥇 Más barato en ${mejor}: ${precioMejor}€\n\nComparado en PRECIOSYA`;
            if (navigator.share) {
                navigator.share({ title: prod.title, text: texto });
            } else {
                navigator.clipboard.writeText(texto).then(() => {
                    const btn = document.getElementById("modalBtnCompartir");
                    btn.innerHTML = `<span class="material-symbols-rounded">check</span> ¡Copiado!`;
                    setTimeout(() => { btn.innerHTML = `<span class="material-symbols-rounded">share</span> Compartir producto`; }, 2000);
                });
            }
        };

        // Productos relacionados
        const grid = document.getElementById("modalRelacionadosGrid");
        grid.innerHTML = "";
        const relacionados = productosBase.filter(p => {
            if (p.id === prod.id) return false;
            if (detectarCategoria(p) === categoria) return true;
            const palabrasProd = prod.title.toLowerCase().split(" ");
            const palabrasP = p.title.toLowerCase().split(" ");
            return palabrasProd.some(w => w.length > 3 && palabrasP.includes(w));
        }).slice(0, 6);

        if (relacionados.length) {
            document.getElementById("modalRelacionados").style.display = "block";
            relacionados.forEach(p => {
                const precios = calcularPreciosSupermercados(p);
                const minPrecio = Math.min(...Object.values(precios).map(v => parseFloat(v)));
                const card = document.createElement("div");
                card.classList.add("relacionado-card");
                card.innerHTML = `
                    <img src="${p.thumbnail}" onerror="this.src='img/logo2.png'">
                    <span class="rel-nombre">${p.title}</span>
                    <span class="rel-precio">desde ${minPrecio.toFixed(2)}€</span>
                `;
                card.onclick = () => abrirProductoModal(p.id);
                grid.appendChild(card);
            });
        } else {
            document.getElementById("modalRelacionados").style.display = "none";
        }

        document.getElementById("productoModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
    };

    window.cerrarProductoModal = () => {
        document.getElementById("productoModal").classList.add("hidden");
        document.body.style.overflow = "";
    };

    document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarProductoModal(); });

    // ============================================================
    // FILTROS MÓVIL
    // ============================================================
    const btnAbrirFiltros = document.getElementById("btnAbrirFiltros");
    const filtersPanel    = document.getElementById("filtersPanel");
    const filtrosOverlay  = document.getElementById("filtrosOverlay");

    btnAbrirFiltros.onclick = () => {
        filtersPanel.classList.toggle("visible");
        filtrosOverlay.classList.toggle("visible");
    };
    filtrosOverlay.onclick = (e) => {
        if (e.target === filtrosOverlay) {
            filtersPanel.classList.remove("visible");
            filtrosOverlay.classList.remove("visible");
        }
    };
    document.addEventListener("click", (e) => {
        const isFilterBtn = e.target.closest("#btnAbrirFiltros");
        const isFilterPanel = e.target.closest("#filtersPanel");
        if (!isFilterBtn && !isFilterPanel && filtersPanel.classList.contains("visible")) {
            filtersPanel.classList.remove("visible");
            filtrosOverlay.classList.remove("visible");
        }
    });
    document.getElementById("btnAplicarFiltros").onclick = () => {
        filtersPanel.classList.remove("visible");
        filtrosOverlay.classList.remove("visible");
        filtrarYPrepararRender();
    };
    document.getElementById("filtroOrden").onchange = () => {
        filtersPanel.classList.remove("visible");
        filtrosOverlay.classList.remove("visible");
        filtrarYPrepararRender();
    };
    document.getElementById("btnReiniciarFiltros").onclick = () => {
        document.getElementById("filtroSuper").value = "";
        document.getElementById("filtroCategoria").value = "";
        document.getElementById("filtroPrecioMin").value = "";
        document.getElementById("filtroPrecioMax").value = "";
        document.getElementById("filtroOrden").value = "";
        filtersPanel.classList.remove("visible");
        filtrosOverlay.classList.remove("visible");
        filtrarYPrepararRender();
    };

    // ------------------ TOGGLE VISTA ------------------
    const viewGrid = document.getElementById("viewGrid");
    const viewList = document.getElementById("viewList");

    if (viewGrid) viewGrid.addEventListener("click", () => {
        resultados.classList.remove("list-view");
        viewGrid.classList.add("active"); if (viewList) viewList.classList.remove("active");
        localStorage.setItem("preciosya_vista", "grid");
    });
    if (viewList) viewList.addEventListener("click", () => {
        resultados.classList.add("list-view");
        viewList.classList.add("active"); if (viewGrid) viewGrid.classList.remove("active");
        localStorage.setItem("preciosya_vista", "list");
    });
    if (localStorage.getItem("preciosya_vista") === "list") {
        resultados.classList.add("list-view");
        if (viewList) viewList.classList.add("active");
        if (viewGrid) viewGrid.classList.remove("active");
    }

    function animarCarrito() {
        const icon = cartToggle.querySelector(".material-symbols-rounded");
        icon.classList.remove("cart-shake");
        void icon.offsetWidth;
        icon.classList.add("cart-shake");
        icon.addEventListener("animationend", () => icon.classList.remove("cart-shake"), { once: true });
    }

    cargarCarritoDesdeLink();



    // ── Sincronizar menú hamburguesa con estado de sesión ────────
function actualizarMenuHamburguesa() {
    const logueado   = document.getElementById('menuUsuarioLogueado');
    const deslog     = document.getElementById('menuUsuarioDeslogueado');
    const secAdmin   = document.getElementById('menuSeccionAdmin');
    const nomEl      = document.getElementById('menuUsuarioNombre');
    const emailEl    = document.getElementById('menuUsuarioEmail');

    if (usuarioActual) {
        logueado.classList.remove('hidden');
        deslog.classList.add('hidden');
        if (nomEl)   nomEl.textContent   = usuarioActual.nombre;
        if (emailEl) emailEl.textContent = usuarioActual.email;
        // Solo muestra panel admin si rol === 'admin'
        if (secAdmin) secAdmin.style.display = usuarioActual.rol === 'admin' ? '' : 'none';
    } else {
        logueado.classList.add('hidden');
        deslog.classList.remove('hidden');
        if (secAdmin) secAdmin.style.display = 'none';
    }
}

// Botones del menú hamburguesa
document.getElementById('menuBtnLogin')?.addEventListener('click', () => {
    cerrarMenu();
    abrirAuthModal();
});
document.getElementById('menuBtnRegistro')?.addEventListener('click', () => {
    cerrarMenu();
    abrirAuthModal();
    mostrarRegistroForm();
});
document.getElementById('menuBtnLogout')?.addEventListener('click', () => {
    cerrarMenu();
    cerrarSesion();
});

// Llamar una vez al cargar para sincronizar el menú
actualizarMenuHamburguesa();
});