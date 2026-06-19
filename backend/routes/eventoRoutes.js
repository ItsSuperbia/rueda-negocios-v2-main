const express = require("express");
const router = express.Router();

const {
    crearEvento,
    getEventosPendientes,
    getEventoById,
    cambiarEstadoEvento,
    getAdminEventoDashboard,
    getAdminEventos,
    getEventosCatalogoEmpresa,
    getMisEventosInscritos,
    getEventoInscripciones,
    getEmpresaEventosResumen,
    inscribirseEvento,
    cancelarInscripcionEvento,
    cancelarParticipanteEvento
} = require("../controllers/eventoController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Crear evento (solo adminEvento)
router.post("/", protect, (req, res, next) => {
    if (req.user.role !== "adminEvento") {
        return res.status(403).json({ message: "No autorizado" });
    }
    next();
}, crearEvento);

// Obtener eventos pendientes (adminSistema)
router.get("/pendientes", protect, adminOnly, getEventosPendientes);

// Eventos creados (adminEvento)
router.get("/admin", protect, (req, res, next) => {
    if (req.user.role !== "adminEvento" && req.user.role !== "adminSistema") {
        return res.status(403).json({ message: "No autorizado" });
    }
    next();
}, getAdminEventos);

// Dashboard adminEvento
router.get("/admin/dashboard", protect, (req, res, next) => {
    if (req.user.role !== "adminEvento") {
        return res.status(403).json({ message: "No autorizado" });
    }
    next();
}, getAdminEventoDashboard);

// Catalogo y eventos inscritos para empresas
router.get("/catalogo", protect, getEventosCatalogoEmpresa);
router.get("/mis-inscripciones", protect, getMisEventosInscritos);
router.get("/empresa/resumen", protect, getEmpresaEventosResumen);

// Inscripcion de empresas
router.post("/:id/inscripcion", protect, inscribirseEvento);
router.delete("/:id/inscripcion", protect, cancelarInscripcionEvento);

// Listado de inscripciones por evento
router.get("/:id/inscripciones", protect, getEventoInscripciones);
router.delete("/:id/inscripciones/:inscripcionId", protect, cancelarParticipanteEvento);

// Obtener un evento por ID segun rol
router.get("/:id", protect, getEventoById);

// Cambiar estado evento (adminSistema)
router.put("/:id/estado", protect, adminOnly, cambiarEstadoEvento);

module.exports = router;
