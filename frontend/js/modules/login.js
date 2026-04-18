// frontend/js/pages/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('http://127.0.0.1:4000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                loginMessage.textContent = result.message || 'Error en el inicio de sesión';
                loginMessage.style.color = 'red';
                return;
            }

            // Guardar token y datos del usuario
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', result.user.role);
            localStorage.setItem('userEmail', result.user.email);

            loginMessage.textContent = '✅ Inicio de sesión exitoso';
            loginMessage.style.color = 'green';

            // Redirigir según rol
            if (result.user.role === 'adminSistema') {
                window.location.href = './admin-dashboard.html';
            } else {
                window.location.href = './perfil.html';
            }

        } catch (error) {
            console.error('❌ Error en la conexión:', error);
            loginMessage.textContent = 'No se pudo conectar con el servidor';
            loginMessage.style.color = 'red';
        }
    });
});
