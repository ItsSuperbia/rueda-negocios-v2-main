document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const mensaje = document.getElementById("mensaje");

    // Helper: subir un archivo al backend, devuelve URL o null
    async function uploadFile(file, destFolder = "docs") {
        if (!file) return null;
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", destFolder);
            const res = await fetch(`${API_URL}/uploads`, {
                method: "POST",
                body: formData
            });
            if (!res.ok) {
                console.warn("Upload falló:", await res.text());
                return null;
            }
            const json = await res.json();
            return json.url; // asumimos { url: "http://.../uploads/..." }
        } catch (err) {
            console.error("Error upload:", err);
            return null;
        }
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        mensaje.textContent = "Procesando...";

        const formData = new FormData(form);

        // Construir objeto base
        const data = {
            email: formData.get("email"),
            password: formData.get("password"),
            role: formData.get("role"),
            nombreEmpresa: formData.get("nombreEmpresa"),
            sector: formData.get("sector") === "Otro" ? (document.getElementById("sectorOtro").value || "Otro") : formData.get("sector"),
            formalizada: formData.get("formalizada") === "true",
            aceptaTerminos: formData.get("aceptaTerminos") ? true : false,
            datosContacto: {
                correo: formData.get("datosContacto.correo") || "",
                telefono: formData.get("datosContacto.telefono") || "",
                direccion: formData.get("datosContacto.direccion") || "",
                redes: formData.get("datosContacto.redes") ? formData.get("datosContacto.redes").split(",").map(s => s.trim()).filter(Boolean) : []
            },
            representante: {
                nombre: formData.get("representante.nombre") || "",
                documento: formData.get("representante.documento") || "",
                cargo: formData.get("representante.cargo") || ""
            }
        };

        // 1) Logo: preferir upload, si no, usar URL de texto
        const logoFile = form.querySelector('input[name="logoEmpresaFile"]').files[0];
        let logoUrl = null;
        if (logoFile) {
            logoUrl = await uploadFile(logoFile, "logos");
        }
        if (!logoUrl) {
            logoUrl = formData.get("logoEmpresaUrl") || "";
        }
        data.logoEmpresa = logoUrl;

        // 2) Formalizada -> manejar documentos
        if (data.formalizada) {
            // subir cada archivo si existe, si no usar campo URL manual
            const rutFile = form.querySelector('input[name="rutFile"]').files[0];
            const certFile = form.querySelector('input[name="certificadoExistenciaFile"]').files[0];
            const cedulaRepFile = form.querySelector('input[name="cedulaRepresentanteFile"]').files[0];

            const rutUrl = rutFile ? await uploadFile(rutFile, "docs") : (formData.get("rutUrl") || "");
            const certUrl = certFile ? await uploadFile(certFile, "docs") : (formData.get("certificadoExistenciaUrl") || "");
            const cedulaRepUrl = cedulaRepFile ? await uploadFile(cedulaRepFile, "docs") : (formData.get("cedulaRepresentanteUrl") || "");

            data.documentosFormalizados = {
                rut: rutUrl,
                certificadoExistencia: certUrl,
                cedulaRepresentante: cedulaRepUrl
            };
        } else {
            // No formalizada -> rutProvisional + docs no formalizados
            data.rutProvisional = formData.get("rutProvisional") || "";

            const compFile = form.querySelector('input[name="comprobanteMatriculaFile"]').files[0];
            const cedulaSolFile = form.querySelector('input[name="cedulaSolicitanteFile"]').files[0];

            const compUrl = compFile ? await uploadFile(compFile, "docs") : (formData.get("comprobanteMatriculaUrl") || "");
            const cedulaSolUrl = cedulaSolFile ? await uploadFile(cedulaSolFile, "docs") : (formData.get("cedulaSolicitanteUrl") || "");

            data.documentosNoFormalizados = {
                comprobanteMatricula: compUrl,
                cedulaSolicitante: cedulaSolUrl
            };
        }

        // 3) Catalogo / Necesidades según rol
        if (data.role === "ofertante") {
            const catFile = form.querySelector('input[name="catalogoFile"]').files[0];
            const catUrl = catFile ? await uploadFile(catFile, "catalogos") : (formData.get("catalogoUrl") || "");
            data.catalogoPDF = catUrl;
        } else if (data.role === "demandante") {
            const necFile = form.querySelector('input[name="necesidadesFile"]').files[0];
            const necUrl = necFile ? await uploadFile(necFile, "catalogos") : (formData.get("necesidadesUrl") || "");
            data.necesidadesPDF = necUrl;
        }

        // Finalmente enviar registro
        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok) {
                mensaje.textContent = "✅ Registro exitoso";
                form.reset();
            } else {
                mensaje.textContent = "❌ " + (result.message || JSON.stringify(result));
            }
        } catch (err) {
            console.error(err);
            mensaje.textContent = "❌ Error de conexión con el servidor";
        }
    });
});
