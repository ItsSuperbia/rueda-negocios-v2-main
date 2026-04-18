document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("eventoForm");
    const mensaje = document.getElementById("mensaje");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "adminEvento") {
        alert("Acceso no autorizado");
        return window.location.href = "../login.html";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch("http://127.0.0.1:4000/api/eventos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const json = await res.json();

            if (!res.ok) {
                mensaje.textContent = json.message || "Error creando evento";
                mensaje.style.color = "red";
                return;
            }

            mensaje.textContent = "Evento creado con éxito";
            mensaje.style.color = "green";
            form.reset();

        } catch (err) {
            mensaje.textContent = "Error conectando con el servidor";
            mensaje.style.color = "red";
        }
    });
});
