/**
 * Sidebar Component para Admin de Evento
 * Panel lateral que se abre/cierra con botón
 */

function renderSidebarAdminEvento(activePage = '') {
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
                <span class="sidebar-title">🎪 Admin Evento</span>
                <button class="sidebar-close" onclick="closeSidebar()" title="Cerrar menú">✕</button>
            </div>
            <nav class="sidebar-nav">
                <a href="admin-evento-dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">
                    <span class="nav-icon">📊</span>
                    <span class="nav-text">Panel Principal</span>
                </a>
                <a href="crear-evento.html" class="${activePage === 'crear' ? 'active' : ''}">
                    <span class="nav-icon">➕</span>
                    <span class="nav-text">Crear Evento</span>
                </a>
                <a href="mis-eventos-admin.html" class="${activePage === 'eventos' ? 'active' : ''}">
                    <span class="nav-icon">📋</span>
                    <span class="nav-text">Mis Eventos</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <button class="sidebar-logout" onclick="cerrarSesionAdminEvento()">
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

function cerrarSesionAdminEvento() {
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
    
    if (path.includes('admin-evento-dashboard')) activePage = 'dashboard';
    else if (path.includes('crear-evento')) activePage = 'crear';
    else if (path.includes('mis-eventos-admin')) activePage = 'eventos';
    
    renderSidebarAdminEvento(activePage);
});
