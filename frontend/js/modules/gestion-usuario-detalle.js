document.addEventListener("DOMContentLoaded", cargarDetalles);

async function cargarDetalles() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "adminSistema") {
        alert("Acceso no autorizado");
        return (window.location.href = "./login.html");
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        document.getElementById("detallesUsuario").innerHTML = "<p>Error: ID inválido</p>";
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:4000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const user = await res.json();

        if (!res.ok) {
            document.getElementById("detallesUsuario").innerHTML =
                `<p>Error al cargar usuario: ${user.message}</p>`;
            return;
        }

        renderDetalles(user);

    } catch (error) {
        document.getElementById("detallesUsuario").innerHTML =
            "<p>Error de conexión con el servidor</p>";
    }
}

function renderDetalles(user) {
    const container = document.getElementById("detallesUsuario");

    const fileLink = file =>
        file ? `<a href="http://127.0.0.1:4000/${file}" target="_blank" class="file-link">📄 Ver archivo</a>` : `<span class="file-missing">No adjuntado</span>`;

    const estadoClass = {
        'pendiente': 'status-pending',
        'aprobado': 'status-approved',
        'rechazado': 'status-rejected'
    }[user.estadoRegistro] || 'status-pending';

    container.innerHTML = `
        <!-- Header del usuario -->
        <div class="user-header">
            <div class="user-header-info">
                <h2 style="margin-bottom: 0.5rem;">${user.nombreEmpresa || "Sin nombre de empresa"}</h2>
                <span class="status-badge ${estadoClass}">${user.estadoRegistro}</span>
            </div>
            ${user.logoEmpresa ? `<img src="http://127.0.0.1:4000/${user.logoEmpresa}" alt="Logo" class="company-logo">` : ''}
        </div>

        <!-- Grid de información básica -->
        <div class="info-grid">
            <div class="info-card">
                <div class="info-card-icon">📧</div>
                <div class="info-card-content">
                    <span class="info-label">Email</span>
                    <span class="info-value">${user.email}</span>
                </div>
            </div>
            <div class="info-card">
                <div class="info-card-icon">👤</div>
                <div class="info-card-content">
                    <span class="info-label">Rol</span>
                    <span class="info-value">${user.role}</span>
                </div>
            </div>
            <div class="info-card">
                <div class="info-card-icon">🏢</div>
                <div class="info-card-content">
                    <span class="info-label">Sector</span>
                    <span class="info-value">${user.sector || "No especificado"}</span>
                </div>
            </div>
            <div class="info-card">
                <div class="info-card-icon">📋</div>
                <div class="info-card-content">
                    <span class="info-label">Formalizada</span>
                    <span class="info-value">${user.formalizada ? "✅ Sí" : "⏳ No"}</span>
                </div>
            </div>
        </div>

        <!-- Sección de documentos -->
        <div class="section-title">
            <h3>📁 Documentos Legales</h3>
        </div>
        
        <div class="docs-grid">
            ${user.formalizada ? `
                <div class="doc-item">
                    <span class="doc-label">NIT</span>
                    <span class="doc-value">${user.nit || "No registrado"}</span>
                </div>
                <div class="doc-item">
                    <span class="doc-label">RUT</span>
                    ${fileLink(user.rutFile)}
                </div>
                <div class="doc-item">
                    <span class="doc-label">Certificado de Existencia</span>
                    ${fileLink(user.certificadoExistenciaFile)}
                </div>
                <div class="doc-item">
                    <span class="doc-label">Cédula Representante</span>
                    ${fileLink(user.cedulaRepresentanteFile)}
                </div>
            ` : `
                <div class="doc-item">
                    <span class="doc-label">RUT Provisional</span>
                    <span class="doc-value">${user.rutProvisional || "No registrado"}</span>
                </div>
                <div class="doc-item">
                    <span class="doc-label">Archivo RUT Provisional</span>
                    ${fileLink(user.rutProvisionalFile)}
                </div>
                <div class="doc-item">
                    <span class="doc-label">Comprobante de Matrícula</span>
                    ${fileLink(user.comprobanteMatricula)}
                </div>
                <div class="doc-item">
                    <span class="doc-label">Cédula Solicitante</span>
                    ${fileLink(user.cedulaSolicitanteFile)}
                </div>
            `}
        </div>

        <!-- Sección de catálogos -->
        <div class="section-title">
            <h3>📚 Catálogos</h3>
        </div>
        
        <div class="docs-grid">
            <div class="doc-item">
                <span class="doc-label">Catálogo PDF</span>
                ${fileLink(user.catalogoPDF)}
            </div>
            <div class="doc-item">
                <span class="doc-label">Necesidades PDF</span>
                ${fileLink(user.necesidadesPDF)}
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="action-buttons">
            <button class="btn btn-success" onclick="cambiarEstado('${user._id}', 'aprobado')">
                ✅ Aprobar Usuario
            </button>
            <button class="btn btn-danger" onclick="cambiarEstado('${user._id}', 'rechazado')">
                ❌ Rechazar Usuario
            </button>
        </div>
    `;
}

async function cambiarEstado(id, estado) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://127.0.0.1:4000/api/users/${id}/estado`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ estado })
        });

        const data = await res.json();
        alert(data.message);

        window.location.href = "./gestion-usuarios.html";

    } catch (error) {
        alert("Error de conexión");
    }
}

function volver() {
    window.location.href = "./gestion-usuarios.html";
}
