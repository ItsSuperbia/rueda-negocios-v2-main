document.addEventListener("DOMContentLoaded", iniciarDashboard);

function iniciarDashboard() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const userEmail = localStorage.getItem("userEmail");

    if (!token || !role) {
        alert("Inicia sesión primero.");
        return (window.location.href = "./login.html");
    }

    document.getElementById("bienvenida").textContent =
        `Bienvenido: ${userEmail} (${role})`;

    const contenedor = document.getElementById("opciones");

    // === ADMIN SISTEMA ================================
    if (role === "adminSistema") {
        contenedor.innerHTML = `
            <button onclick="window.location.href='./gestion-usuarios.html'">
                👥 Gestión de Usuarios
            </button>
            <br><br>

            <button onclick="window.location.href='./gestion-publicaciones.html'">
                📰 Gestión de Publicaciones
            </button>
        `;
    }

    // === ADMIN EVENTO ================================
    if (role === "adminEvento") {
        contenedor.innerHTML = `
            <button onclick="window.location.href='./admin-evento/crear-evento.html'">
                ➕ Crear evento
            </button>
            <br><br>

            <button onclick="window.location.href='./admin-evento/mis-eventos.html'">
                📅 Mis eventos
            </button>
        `;
    }

    // === OFERTANTE ================================
    if (role === "ofertante") {
        contenedor.innerHTML = `
            <button onclick="window.location.href='./ofertante/inscribirme-evento.html'">
                📝 Inscribirme en evento
            </button>
            <br><br>

            <button onclick="window.location.href='./ofertante/mensajes.html'">
                💬 Mensajes
            </button>
        `;
    }

    // === DEMANDANTE ================================
    if (role === "demandante") {
        contenedor.innerHTML = `
            <button onclick="window.location.href='./demandante/inscripciones.html'">
                📝 Eventos disponibles
            </button>
            <br><br>

            <button onclick="window.location.href='./demandante/agenda.html'">
                📆 Mi agenda
            </button>
        `;
    }
}


function cerrarSesion() {
    localStorage.clear();
    window.location.href = "./login.html";
}
