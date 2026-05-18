document.addEventListener("DOMContentLoaded", () => {
    const CLAVE_ACCESO = "Admin";
    const CUSTOM_PRODUCTS_KEY = "preciosya_custom_products";

    // --- CATEGORÍAS SINCRONIZADAS CON EL INDEX ---
    const categoriasSincronizadas = {
        lacteos: "Lácteos",
        carnes: "Carnes",
        pescados: "Pescados",
        panaderia: "Panadería",
        snacks: "Snacks",
        bebidas: "Bebidas",
        cafe_te: "Café y Té",
        cereales: "Cereales, Pasta y Arroz",
        frutas_verduras: "Frutas y Verduras",
        congelados: "Congelados",
        salsas: "Salsas",
        aceites: "Aceites",
        dulces: "Dulces",
        otros: "Otros"
    };

    // ------------------ ELEMENTOS DOM ------------------
    const loginSection = document.getElementById("loginSection");
    const adminContent = document.getElementById("adminContent");
    const adminPass = document.getElementById("adminPass");
    const btnLogin = document.getElementById("btnLogin");
    const btnLogout = document.getElementById("btnLogout");
    const loginError = document.getElementById("loginError");

    const tablaBody = document.getElementById("tablaBody");
    const adminSearch = document.getElementById("adminSearch");
    const formTitle = document.getElementById("formTitle");
    const btnGuardar = document.getElementById("btnGuardar");
    const btnCancelar = document.getElementById("btnCancelar");

    const admId = document.getElementById("admId");
    const admNombre = document.getElementById("admNombre");
    const admCat = document.getElementById("admCat");
    const admMer = document.getElementById("admMer");
    const admCar = document.getElementById("admCar");
    const admDia = document.getElementById("admDia");
    const admLid = document.getElementById("admLid");
    const admImg = document.getElementById("admImg");
    const admDesc = document.getElementById("admDesc");
        // ------------------ MENÚ HAMBURGUESA ------------------
    const adminMenuToggle = document.getElementById("adminMenuToggle");
    const adminMenuPanel = document.getElementById("adminMenuPanel");
    const adminMenuOverlay = document.getElementById("adminMenuOverlay");
    const adminMenuClose = document.getElementById("adminMenuClose");

    function abrirAdminMenu() {
        adminMenuPanel.classList.add("visible");
        adminMenuOverlay.classList.add("visible");
        document.body.style.overflow = "hidden";
    }
    function cerrarAdminMenu() {
        adminMenuPanel.classList.remove("visible");
        adminMenuOverlay.classList.remove("visible");
        document.body.style.overflow = "";
    }
    adminMenuToggle.addEventListener("click", abrirAdminMenu);
    adminMenuClose.addEventListener("click", cerrarAdminMenu);
    adminMenuOverlay.addEventListener("click", cerrarAdminMenu);

    window.scrollToForm = () => {
        cerrarAdminMenu();
        document.querySelector(".sidebar-form").scrollIntoView({ behavior: "smooth" });
    };
    window.scrollToTabla = () => {
        cerrarAdminMenu();
        document.querySelector(".table-container").scrollIntoView({ behavior: "smooth" });
    };

    // ------------------ ESTADÍSTICAS ------------------
    window.abrirEstadisticas = () => {
        cerrarAdminMenu();
        const body = document.getElementById("statsBody");
        const total = productosTotales.length;
        const porCategoria = {};
        productosTotales.forEach(p => {
            const cat = categoriasSincronizadas[p.category] || p.category || "Otros";
            porCategoria[cat] = (porCategoria[cat] || 0) + 1;
        });
        const categoriasOrdenadas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
        const maxCat = categoriasOrdenadas[0]?.[1] || 1;
        const conPrecio = productosTotales.filter(p => {
            const precio = parseFloat(p.preciosFijos?.Mercadona) || parseFloat(p.price) || 0;
            return precio > 0;
        });
        const masBarato = conPrecio.reduce((a, b) => {
            const precioA = parseFloat(a.preciosFijos?.Mercadona) || parseFloat(a.price) || 0;
            const precioB = parseFloat(b.preciosFijos?.Mercadona) || parseFloat(b.price) || 0;
            return precioA < precioB ? a : b;
        }, conPrecio[0]);
        const masCaro = conPrecio.reduce((a, b) => {
            const precioA = parseFloat(a.preciosFijos?.Mercadona) || parseFloat(a.price) || 0;
            const precioB = parseFloat(b.preciosFijos?.Mercadona) || parseFloat(b.price) || 0;
            return precioA > precioB ? a : b;
        }, conPrecio[0]);
        const precioMedio = conPrecio.length ? (conPrecio.reduce((s, p) => s + (parseFloat(p.preciosFijos?.Mercadona) || parseFloat(p.price) || 0), 0) / conPrecio.length).toFixed(2) : "—";
        const customCount = productosCustom.length;
        const noDispCount = { Mercadona: 0, Carrefour: 0, Dia: 0, Lidl: 0 };
        productosTotales.forEach(p => (p.noDisponible || []).forEach(s => { if (noDispCount[s] !== undefined) noDispCount[s]++; }));
        const superMasND = Object.entries(noDispCount).sort((a, b) => b[1] - a[1])[0];

        body.innerHTML = `
            <div class="stats-kpis">
                <div class="stats-kpi"><span class="stats-kpi-valor">${total}</span><span class="stats-kpi-label">Productos totales</span></div>
                <div class="stats-kpi"><span class="stats-kpi-valor">${customCount}</span><span class="stats-kpi-label">Añadidos desde admin</span></div>
                <div class="stats-kpi"><span class="stats-kpi-valor">${precioMedio}€</span><span class="stats-kpi-label">Precio medio</span></div>
                <div class="stats-kpi"><span class="stats-kpi-valor">${Object.keys(porCategoria).length}</span><span class="stats-kpi-label">Categorías activas</span></div>
            </div>
            <div class="stats-section-title">Destacados</div>
            <div class="stats-destacados">
                <div class="stats-dest-card"><span class="stats-dest-icon">🏷️</span><div><div class="stats-dest-nombre">${masBarato?.title || "—"}</div><div class="stats-dest-sub">Producto más barato — ${(parseFloat(masBarato?.preciosFijos?.Mercadona) || parseFloat(masBarato?.price) || 0).toFixed(2)}€</div></div></div>
                <div class="stats-dest-card"><span class="stats-dest-icon">💎</span><div><div class="stats-dest-nombre">${masCaro?.title || "—"}</div><div class="stats-dest-sub">Producto más caro — ${(parseFloat(masCaro?.preciosFijos?.Mercadona) || parseFloat(masCaro?.price) || 0).toFixed(2)}€</div></div></div>
                <div class="stats-dest-card"><span class="stats-dest-icon">⚠️</span><div><div class="stats-dest-nombre">${superMasND[0]}</div><div class="stats-dest-sub">Más productos no disponibles (${superMasND[1]})</div></div></div>
            </div>
            <div class="stats-section-title">Productos por categoría</div>
            <div class="stats-bars">
                ${categoriasOrdenadas.map(([cat, n]) => `
                    <div class="stats-bar-row">
                        <span class="stats-bar-label">${cat}</span>
                        <div class="stats-bar-track"><div class="stats-bar-fill" style="width:${Math.round((n/maxCat)*100)}%"></div></div>
                        <span class="stats-bar-count">${n}</span>
                    </div>
                `).join("")}
            </div>
            <div class="stats-section-title">No disponibles por supermercado</div>
            <div class="stats-nodisp-grid">
                ${Object.entries(noDispCount).map(([s, n]) => `
                    <div class="stats-nodisp-item"><span class="stats-nodisp-super">${s}</span><span class="stats-nodisp-n">${n}</span></div>
                `).join("")}
            </div>
        `;
        document.getElementById("statsModal").classList.remove("hidden");
        document.body.style.overflow = "hidden";
    };

    window.cerrarEstadisticas = () => {
        document.getElementById("statsModal").classList.add("hidden");
        document.body.style.overflow = "";
    };

    let productosCustom = []; // mantenido solo para estadísticas (count = 0 desde BD)
    let productosTotales = [];

    // ------------------ SUBIDA DE IMAGEN ------------------
const tabUrl = document.getElementById("tabUrl");
const tabFile = document.getElementById("tabFile");
const panelUrl = document.getElementById("panelUrl");
const panelFile = document.getElementById("panelFile");
const uploadArea = document.getElementById("uploadArea");
const admImgFile = document.getElementById("admImgFile");
const imgPreview = document.getElementById("imgPreview");
const imgPreviewImg = document.getElementById("imgPreviewImg");
const btnQuitarImg = document.getElementById("btnQuitarImg");

let imagenBase64 = null; // guardará la imagen subida

tabUrl.addEventListener("click", () => {
    tabUrl.classList.add("active");
    tabFile.classList.remove("active");
    panelUrl.classList.remove("hidden");
    panelFile.classList.add("hidden");
    imagenBase64 = null;
    imgPreview.classList.add("hidden");
});

tabFile.addEventListener("click", () => {
    tabFile.classList.add("active");
    tabUrl.classList.remove("active");
    panelFile.classList.remove("hidden");
    panelUrl.classList.add("hidden");
});

uploadArea.addEventListener("click", () => admImgFile.click());

uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) procesarImagen(file);
});

admImgFile.addEventListener("change", () => {
    const file = admImgFile.files[0];
    if (file) procesarImagen(file);
});

function procesarImagen(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagenBase64 = e.target.result;
        imgPreviewImg.src = imagenBase64;
        imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
}

btnQuitarImg.addEventListener("click", () => {
    imagenBase64 = null;
    admImgFile.value = "";
    imgPreview.classList.add("hidden");
});



    // ------------------ INICIALIZACIÓN ------------------
    function inicializarCategoriasAdmin() {
        admCat.innerHTML = "";
        Object.entries(categoriasSincronizadas).forEach(([valor, texto]) => {
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = texto;
            admCat.appendChild(option);
        });
    }

    const resetearFormulario = () => {
        admId.disabled = false;
        document.querySelectorAll(".sidebar-form input").forEach(i => i.value = "");
        document.querySelectorAll(".admNoDisp").forEach(cb => cb.checked = false);
        admCat.selectedIndex = 0;
        admDesc.value = "";
        formTitle.innerText = "Nuevo Producto";
        btnGuardar.innerText = "Guardar";
        btnCancelar.classList.add("hidden");
        imagenBase64 = null;
        admImgFile.value = "";
        imgPreview.classList.add("hidden");
        tabUrl.classList.add("active");
        tabFile.classList.remove("active");
        panelUrl.classList.remove("hidden");
        panelFile.classList.add("hidden");
    };

    // ------------------ CARGA DESDE BASE DE DATOS ------------------
    async function cargarTodo() {
        try {
            const res = await fetch("api.php", { credentials: "include" });
            const data = await res.json();
            productosTotales = (data.products || []).map(p => ({ ...p, id: Number(p.id) })).sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error("Error cargando productos desde BD:", error);
            productosTotales = [];
        }
        renderTabla();
    }

    // ------------------ TABLA ------------------
    function renderTabla() {
        const query = adminSearch.value.toLowerCase();
        tablaBody.innerHTML = "";

        const filtrados = productosTotales.filter(p =>
            p.title.toLowerCase().includes(query) || p.id.toString().includes(query)
        );

        filtrados.forEach(p => {
            const tr = document.createElement("tr");
            const precios = p.preciosFijos || {};
            const noDisp = p.noDisponible || [];

            const precioCell = (super_) => {
                const nd = noDisp.includes(super_);
                const val = precios[super_];
                return nd
                    ? `<span class="badge-nodisp">No disp.</span>`
                    : val ? `${parseFloat(val).toFixed(2)}€` : '-';
            };

            tr.innerHTML = `
                <td><img src="${p.thumbnail}" class="img-mini" onerror="this.src='img/logo2.png'"></td>
                <td>${p.id}</td>
                <td>${p.title}</td>
                <td>${precioCell("Mercadona")}</td>
                <td>${precioCell("Carrefour")}</td>
                <td>${precioCell("Dia")}</td>
                <td>${precioCell("Lidl")}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEdicion(${p.id})">✎</button>
                    <button class="btn-delete" onclick="eliminarProducto(${p.id})">🗑</button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
    }

    // ------------------ EDICIÓN ------------------
    window.prepararEdicion = (id) => {
        const p = productosTotales.find(prod => prod.id === id);
        if (!p) return;

        admId.value = p.id;
        admId.disabled = true;
        admNombre.value = p.title;
        admDesc.value = p.description || "";
        admCat.value = p.category || "otros";
        admMer.value = p.preciosFijos?.Mercadona || p.price || "";
        admCar.value = p.preciosFijos?.Carrefour || "";
        admDia.value = p.preciosFijos?.Dia || "";
        admLid.value = p.preciosFijos?.Lidl || "";
        admImg.value = p.thumbnail || "";

        // Cargar checkboxes de no disponible
        const noDisp = p.noDisponible || [];
        document.querySelectorAll(".admNoDisp").forEach(cb => {
            cb.checked = noDisp.includes(cb.value);
        });
        // Cargar alérgenos
        const allergens = p.allergens || [];
        document.querySelectorAll(".admAllergen").forEach(cb => {
            cb.checked = allergens.includes(cb.value);
        });

        document.querySelectorAll(".admAllergen").forEach(cb => cb.checked = false);

        formTitle.innerText = "Editando Producto";
        btnGuardar.innerText = "Actualizar";
        btnCancelar.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ------------------ GUARDAR ------------------
    btnGuardar.onclick = async () => {
        const id = Number(admId.value);
        if (!id || !admNombre.value) return alert("ID y Nombre son obligatorios");

        const noDisponible = [];
        document.querySelectorAll(".admNoDisp:checked").forEach(cb => noDisponible.push(cb.value));
        const allergens = [];
        document.querySelectorAll(".admAllergen:checked").forEach(cb => allergens.push(cb.value));

        const merPrecio = parseFloat(admMer.value) || 0;

        const body = {
            accion: "producto_guardar",
            id: admId.disabled ? id : null,
            nombre: admNombre.value,
            descripcion: admDesc.value || admNombre.value.toLowerCase(),
            categoria: admCat.value,
            precio_mercadona: merPrecio,
            precio_carrefour: admCar.value ? parseFloat(admCar.value) : parseFloat((merPrecio * 1.05).toFixed(2)),
            precio_dia:       admDia.value ? parseFloat(admDia.value) : parseFloat((merPrecio * 1.03).toFixed(2)),
            precio_lidl:      admLid.value ? parseFloat(admLid.value) : parseFloat((merPrecio * 0.98).toFixed(2)),
            imagen: imagenBase64 || admImg.value || "img/logo2.png",
            alergenos: allergens.join(","),
            no_disponible: noDisponible.join(",")
        };

        try {
            const res = await fetch("api.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.ok) {
                resetearFormulario();
                await cargarTodo();
                alert("¡Producto guardado correctamente!");
            } else {
                alert("Error: " + (data.error || "No se pudo guardar."));
            }
        } catch(e) {
            alert("Error de conexión.");
        }
    };

    // ------------------ ELIMINAR ------------------
    window.eliminarProducto = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            const res = await fetch("api.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "producto_eliminar", id })
            });
            const data = await res.json();
            if (data.ok) {
                await cargarTodo();
            } else {
                alert("Error: " + (data.error || "No se pudo eliminar."));
            }
        } catch(e) {
            alert("Error de conexión.");
        }
    };

    adminSearch.oninput = renderTabla;
    btnCancelar.onclick = resetearFormulario;

    // ------------------ AUTH ------------------
    btnLogout.onclick = async () => {
        await fetch("auth.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" })
        });
        sessionStorage.removeItem("isAdmin");
        location.reload();
    };

    function mostrarPanel() {
        loginSection.style.display = "none";
        adminContent.classList.remove("hidden");
        inicializarCategoriasAdmin();
        cargarTodo();
    }

    async function checkAuth() {
        // Comprobar sesión activa en servidor
        try {
            const res = await fetch("auth.php?action=sesion", { credentials: "include" });
            const data = await res.json();
            if (data.logueado && data.usuario.rol === "admin") {
                sessionStorage.setItem("isAdmin", "true");
                mostrarPanel();
                return;
            }
        } catch(e) {}
        // Fallback sessionStorage
        if (sessionStorage.getItem("isAdmin") === "true") {
            mostrarPanel();
        }
    }

    btnLogin.onclick = async () => {
        const email    = document.getElementById("adminEmail")?.value.trim() || "";
        const password = adminPass.value.trim();
        loginError.style.display = "none";

        try {
            const res  = await fetch("auth.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password })
            });
            const data = await res.json();

            if (data.ok && data.usuario.rol === "admin") {
                sessionStorage.setItem("isAdmin", "true");
                mostrarPanel();
            } else {
                loginError.textContent = data.ok ? "Esta cuenta no tiene permisos de admin." : (data.error || "Credenciales incorrectas.");
                loginError.style.display = "block";
            }
        } catch(e) {
            loginError.textContent = "Error de conexión. ¿Está XAMPP activo?";
            loginError.style.display = "block";
        }
    };

    adminPass.addEventListener("keydown", e => {
        if (e.key === "Enter") btnLogin.click();
    });

    checkAuth();
});