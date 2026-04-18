document.addEventListener("DOMContentLoaded", cargarUsuarios);

async function cargarUsuarios() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const tbody = document.getElementById("userTableBody");
    const mensaje = document.getElementById("mensaje");

    if (!token || role !== "adminSistema") {
        mensaje.textContent = "Acceso no autorizado";
        return (window.location.href = "./login.html");
    }

    try {
        const res = await fetch("http://127.0.0.1:4000/api/users", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
            mensaje.textContent = data.message || "Error al obtener usuarios";
            return;
        }

        tbody.innerHTML = "";
        data.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.estadoRegistro}</td>
        <td>
            <button class="btn btn-primary btn-block"onclick="verDetalles('${user._id}')">Ver detalles</button>
        </td>
        `;
            tbody.appendChild(row);
        });
    } catch (error) {
        mensaje.textContent = "Error de conexión con el servidor";
    }
}

function verDetalles(id) {
    window.location.href = `./gestion-usuario-detalle.html?id=${id}`;
}

async function cambiarEstado(id, estado) {
    const token = localStorage.getItem("token");

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
    cargarUsuarios();
}

function volver() {
    window.location.href = "./admin-dashboard.html";
}
