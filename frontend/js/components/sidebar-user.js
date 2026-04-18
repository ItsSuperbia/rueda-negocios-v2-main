/**
 * Sidebar Component para Usuario Normal
 * Panel lateral que se abre/cierra con botón
 */

function renderSidebarUser(activePage = '') {
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
                <span class="sidebar-title">🏢 Mi Cuenta</span>
                <button class="sidebar-close" onclick="closeSidebar()" title="Cerrar menú">✕</button>
            </div>
            <nav class="sidebar-nav">
                <a href="profile.html" class="${activePage === 'profile' ? 'active' : ''}">
                    <span class="nav-icon">👤</span>
                    <span class="nav-text">Mi Perfil</span>
                </a>
                <a href="matches.html" class="${activePage === 'matches' ? 'active' : ''}">
                    <span class="nav-icon">🤝</span>
                    <span class="nav-text">Mis Matches</span>
                </a>
                <a href="agenda.html" class="${activePage === 'agenda' ? 'active' : ''}">
                    <span class="nav-icon">📅</span>
                    <span class="nav-text">Mi Agenda</span>
                </a>
                <a href="eventos.html" class="${activePage === 'eventos' ? 'active' : ''}">
                    <span class="nav-icon">🎯</span>
                    <span class="nav-text">Eventos</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <button class="sidebar-logout" onclick="cerrarSesionUser()">
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

function cerrarSesionUser() {
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
    
    if (path.includes('profile')) activePage = 'profile';
    else if (path.includes('matches')) activePage = 'matches';
    else if (path.includes('agenda')) activePage = 'agenda';
    else if (path.includes('eventos')) activePage = 'eventos';
    
    renderSidebarUser(activePage);
});
