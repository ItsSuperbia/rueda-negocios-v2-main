document.addEventListener("DOMContentLoaded", cargarDetalle);

async function cargarDetalle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const token = localStorage.getItem("token");

    const res = await fetch(`http://127.0.0.1:4000/api/eventos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const evento = await res.json();

    document.getElementById("detalle").innerHTML = `
        <p><strong>Título:</strong> ${evento.title}</p>
        <p><strong>Descripción:</strong> ${evento.description}</p>
        <p><strong>Inicio:</strong> ${new Date(evento.startDate).toLocaleDateString()}</p>
        <p><strong>Fin:</strong> ${new Date(evento.endDate).toLocaleDateString()}</p>
        <p><strong>Duración días:</strong> ${evento.durationDays}</p>
        <p><strong>Modalidad:</strong> ${evento.modalidad}</p>
        <p><strong>Cupos:</strong> ${evento.cupos}</p>
        <p><strong>Valor inscripción:</strong> $${evento.valorInscripcion}</p>
        <p><strong>Enfoque:</strong> ${evento.enfoque}</p>
    `;

    document.getElementById("btnAprobar").onclick = () => cambiarEstado(id, "aprobado");
    document.getElementById("btnRechazar").onclick = () => cambiarEstado(id, "rechazado");
}

async function cambiarEstado(id, estado) {
    const mensaje = document.getElementById("mensaje");
    const token = localStorage.getItem("token");

    const res = await fetch(`http://127.0.0.1:4000/api/eventos/${id}/estado`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
    });

    const data = await res.json();
    mensaje.textContent = data.message;

    setTimeout(() => {
        window.location.href = "./gestion-eventos.html";
    }, 1500);
}
