document.addEventListener("DOMContentLoaded", cargarEventos);

async function cargarEventos() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const tbody = document.getElementById("tablaEventos");

    if (!token || role !== "adminSistema") {
        alert("Acceso no autorizado");
        return window.location.href = "../login.html";
    }

    const res = await fetch("http://127.0.0.1:4000/api/eventos/pendientes", {
        headers: { Authorization: `Bearer ${token}` }
    });

    const eventos = await res.json();

    tbody.innerHTML = "";

    eventos.forEach(ev => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${ev.title}</td>
            <td>${ev.modalidad}</td>
            <td>${ev.cupos}</td>
            <td>
                <button onclick="verDetalle('${ev._id}')">Ver</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function verDetalle(id) {
    window.location.href = `./evento-detalle.html?id=${id}`;
}
