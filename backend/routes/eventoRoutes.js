const express = require("express");
const router = express.Router();

const { crearEvento, getEventosPendientes, getEventoById, cambiarEstadoEvento } =
    require("../controllers/eventoController");

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

// Obtener un evento por ID (adminSistema)
router.get("/:id", protect, adminOnly, getEventoById);

// Cambiar estado evento (adminSistema)
router.put("/:id/estado", protect, adminOnly, cambiarEstadoEvento);

module.exports = router;
