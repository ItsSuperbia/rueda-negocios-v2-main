/**
 * Sidebar Component para Admin
 * Panel lateral que se abre/cierra con botón
 */

function renderSidebarAdmin(activePage = '') {
    // Crear elementos del sidebar
    const sidebarHTML = `
        <!-- Botón toggle - siempre visible -->
        <button class="sidebar-toggle" id="sidebarToggle" onclick="toggleSidebar()" title="Abrir menú">
            <span class="toggle-icon">☰</span>
        </button>
        
        <!-- Overlay para cerrar -->
        <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
        
        <!-- Sidebar Panel -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <span class="sidebar-title">📊 Panel Admin</span>
                <button class="sidebar-close" onclick="closeSidebar()" title="Cerrar menú">✕</button>
            </div>
            <nav class="sidebar-nav">
                <a href="admin-dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Panel Principal</span>
                </a>
                <a href="gestion-usuarios.html" class="${activePage === 'usuarios' ? 'active' : ''}">
                    <span class="nav-icon">👥</span>
                    <span class="nav-text">Gestión de Usuarios</span>
                </a>
                <a href="gestion-publicaciones.html" class="${activePage === 'publicaciones' ? 'active' : ''}">
                    <span class="nav-icon">📰</span>
                    <span class="nav-text">Publicaciones</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <button class="sidebar-logout" onclick="cerrarSesionAdmin()">
                    <span class="nav-icon">🚪</span>
                    <span class="nav-text">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    `;
    
    // Insertar al inicio del body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.classList.add('sidebar-open');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

function cerrarSesionAdmin() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Cerrar sidebar con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Detectar la página actual
    const path = window.location.pathname;
    let activePage = '';
    
    if (path.includes('admin-dashboard')) activePage = 'dashboard';
    else if (path.includes('gestion-usuarios') || path.includes('detalle-usuario')) activePage = 'usuarios';
    else if (path.includes('gestion-publicaciones')) activePage = 'publicaciones';
    
    renderSidebarAdmin(activePage);
});
