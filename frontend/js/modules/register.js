// register.js - Sistema de registro dinámico basado en roles

document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const roleSelect = document.getElementById('role');
    const sectorSelect = document.getElementById('sector');
    const sectorOtro = document.getElementById('sectorOtro');
    const formalizadaSelect = document.getElementById('formalizada');
    const noFormalizadaDiv = document.getElementById('noFormalizada');
    const formalizadaDiv = document.getElementById('Formalizada');
    const registerForm = document.getElementById('registerForm');

    // Obtener fieldsets correctamente
    const allFieldsets = Array.from(document.querySelectorAll('fieldset'));
    const datosEmpresaFieldset = allFieldsets.find(
        fs => fs.querySelector('legend')?.textContent.trim() === 'Datos de la empresa'
    );
    const representanteFieldsetElement = allFieldsets.find(
        fs => fs.querySelector('legend')?.textContent.trim() === 'Representante'
    );
    const catalogosFieldset = allFieldsets.find(
        fs => fs.querySelector('legend')?.textContent.trim() === 'Catálogos'
    );
    const datosContactoDiv = document.getElementById('datosContacto');

    // Inicializar: ocultar todo excepto credenciales
    ocultarTodoExceptoCredenciales();

    // Event listener para cambio de rol
    roleSelect.addEventListener('change', function () {
        const rolSeleccionado = this.value;
        manejarCambioRol(rolSeleccionado);
    });

    // Event listener para sector "Otro"
    sectorSelect.addEventListener('change', function () {
        if (this.value === 'Otro') {
            sectorOtro.style.display = 'inline-block';
            sectorOtro.required = true;
        } else {
            sectorOtro.style.display = 'none';
            sectorOtro.required = false;
            sectorOtro.value = '';
        }
    });

    // Event listener para empresa formalizada
    formalizadaSelect.addEventListener('change', function () {
        const esFormalizada = this.value === 'true';

        if (this.value === '') {
            noFormalizadaDiv.style.display = 'none';
            formalizadaDiv.style.display = 'none';
            deshabilitarCamposFormalizacion();
        } else if (esFormalizada) {
            noFormalizadaDiv.style.display = 'none';
            formalizadaDiv.style.display = 'block';
            deshabilitarCampos(noFormalizadaDiv);
            habilitarCampos(formalizadaDiv);
        } else {
            noFormalizadaDiv.style.display = 'block';
            formalizadaDiv.style.display = 'none';
            deshabilitarCampos(formalizadaDiv);
            habilitarCampos(noFormalizadaDiv);
        }
    });

    // Event listener para envío del formulario
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const rolSeleccionado = roleSelect.value;

        // Validar según el rol
        if (!validarFormularioSegunRol(formData, rolSeleccionado)) {
            return;
        }

        console.log('Formulario válido para rol:', rolSeleccionado);
        console.log('Datos del formulario:', Object.fromEntries(formData));

        // ✅ Aquí realmente se envía al backend
        enviarDatos(formData);
    });


    /**
     * Oculta todos los fieldsets excepto las credenciales
     */
    function ocultarTodoExceptoCredenciales() {
        datosEmpresaFieldset.style.display = 'none';
        datosContactoDiv.style.display = 'none';
        if (representanteFieldsetElement) {
            representanteFieldsetElement.style.display = 'none';
        }
        catalogosFieldset.style.display = 'none';
        noFormalizadaDiv.style.display = 'none';
        formalizadaDiv.style.display = 'none';

        deshabilitarCamposNoCredenciales();
    }

    /**
     * Maneja el cambio de rol y muestra/oculta secciones correspondientes
     */
    function manejarCambioRol(rol) {
        // Resetear formulario
        ocultarTodoExceptoCredenciales();

        switch (rol) {
            case 'ofertante':
                mostrarSeccionesOfertante();
                break;
            case 'demandante':
                mostrarSeccionesDemandante();
                break;
            case 'adminEvento':
                mostrarSeccionesAdminEvento();
                break;
            case 'adminSistema':
                // Solo credenciales (ya está así por defecto)
                break;
            default:
                ocultarTodoExceptoCredenciales();
        }
    }

    /**
     * Muestra secciones para rol Ofertante
     */
    function mostrarSeccionesOfertante() {
        datosEmpresaFieldset.style.display = 'block';
        datosContactoDiv.style.display = 'block';
        if (representanteFieldsetElement) {
            representanteFieldsetElement.style.display = 'block';
        }
        catalogosFieldset.style.display = 'block';

        // Habilitar campos necesarios
        habilitarCampos(datosEmpresaFieldset);
        habilitarCampos(datosContactoDiv);
        if (representanteFieldsetElement) {
            habilitarCampos(representanteFieldsetElement);
        }

        // Mostrar solo catálogo de ofertante
        const catalogoLabel = catalogosFieldset.querySelector('label:nth-of-type(1)');
        const catalogoInput = document.getElementById('catalogoFile');
        const necesidadesLabel = catalogosFieldset.querySelector('label:nth-of-type(2)');
        const necesidadesInput = document.getElementById('necesidadesFile');

        if (catalogoLabel && catalogoInput) {
            catalogoLabel.style.display = 'inline';
            catalogoInput.style.display = 'inline';
            catalogoInput.disabled = false;
        }
        if (necesidadesLabel && necesidadesInput) {
            necesidadesLabel.style.display = 'none';
            necesidadesInput.style.display = 'none';
            necesidadesInput.disabled = true;
        }
    }

    /**
     * Muestra secciones para rol Demandante
     */
    function mostrarSeccionesDemandante() {
        datosEmpresaFieldset.style.display = 'block';
        datosContactoDiv.style.display = 'block';
        if (representanteFieldsetElement) {
            representanteFieldsetElement.style.display = 'block';
        }
        catalogosFieldset.style.display = 'block';

        // Habilitar campos necesarios
        habilitarCampos(datosEmpresaFieldset);
        habilitarCampos(datosContactoDiv);
        if (representanteFieldsetElement) {
            habilitarCampos(representanteFieldsetElement);
        }

        // Mostrar solo necesidades de demandante
        const catalogoLabel = catalogosFieldset.querySelector('label:nth-of-type(1)');
        const catalogoInput = document.getElementById('catalogoFile');
        const necesidadesLabel = catalogosFieldset.querySelector('label:nth-of-type(2)');
        const necesidadesInput = document.getElementById('necesidadesFile');

        if (catalogoLabel && catalogoInput) {
            catalogoLabel.style.display = 'none';
            catalogoInput.style.display = 'none';
            catalogoInput.disabled = true;
        }
        if (necesidadesLabel && necesidadesInput) {
            necesidadesLabel.style.display = 'inline';
            necesidadesInput.style.display = 'inline';
            necesidadesInput.disabled = false;
        }
    }

    /**
     * Muestra secciones para rol Admin de Evento
     */
    function mostrarSeccionesAdminEvento() {
        datosEmpresaFieldset.style.display = 'block';
        datosContactoDiv.style.display = 'block';
        if (representanteFieldsetElement) {
            representanteFieldsetElement.style.display = 'block';
        }
        // NO mostrar catálogos
        catalogosFieldset.style.display = 'none';

        // Habilitar campos necesarios
        habilitarCampos(datosEmpresaFieldset);
        habilitarCampos(datosContactoDiv);
        if (representanteFieldsetElement) {
            habilitarCampos(representanteFieldsetElement);
        }

        // Deshabilitar inputs de catálogos
        deshabilitarCampos(catalogosFieldset);
    }

    /**
     * Habilita todos los inputs dentro de un contenedor
     */
    function habilitarCampos(contenedor) {
        if (!contenedor) return;
        const inputs = contenedor.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }

    /**
     * Deshabilita todos los inputs dentro de un contenedor
     */
    function deshabilitarCampos(contenedor) {
        if (!contenedor) return;
        const inputs = contenedor.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
            // No limpiar required para mantener la estructura
        });
    }

    /**
     * Deshabilita campos que no son de credenciales
     */
    function deshabilitarCamposNoCredenciales() {
        deshabilitarCampos(datosEmpresaFieldset);
        deshabilitarCampos(datosContactoDiv);
        if (representanteFieldsetElement) {
            deshabilitarCampos(representanteFieldsetElement);
        }
        deshabilitarCampos(catalogosFieldset);
        deshabilitarCamposFormalizacion();
    }

    /**
     * Deshabilita campos de formalización
     */
    function deshabilitarCamposFormalizacion() {
        deshabilitarCampos(noFormalizadaDiv);
        deshabilitarCampos(formalizadaDiv);
    }

    /**
     * Valida el formulario según el rol seleccionado
     */
    function validarFormularioSegunRol(formData, rol) {
        const email = formData.get('email');
        const password = formData.get('password');

        // Validaciones básicas de credenciales (para todos los roles)
        if (!email || !password) {
            alert('Email y contraseña son obligatorios');
            return false;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        // Validaciones específicas por rol
        if (rol === 'ofertante' || rol === 'demandante' || rol === 'adminEvento') {
            const nombreEmpresa = formData.get('nombreEmpresa');
            const sector = formData.get('sector');

            if (!nombreEmpresa || !sector) {
                alert('Debe completar los datos de la empresa');
                return false;
            }

            if (sector === 'Otro' && !formData.get('sectorOtro')) {
                alert('Debe especificar el sector');
                return false;
            }
        }

        return true;
    }

    /**
     * Función para enviar datos al servidor (ejemplo)
     */
    function enviarDatos(formData) {
        fetch('http://127.0.0.1:4000/api/users/register', {
            method: 'POST',
            body: formData
        })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    console.error('Error del servidor:', data);
                    alert(data.message || 'Error en el registro');
                    return;
                }

                console.log('✅ Usuario registrado correctamente:', data);
                alert('✅ Registro exitoso');
                registerForm.reset();
                ocultarTodoExceptoCredenciales();
            })
            .catch(error => {
                console.error('❌ Error en la conexión o en el envío:', error);
                alert('Error en la conexión con el servidor');
            });
    }

});
