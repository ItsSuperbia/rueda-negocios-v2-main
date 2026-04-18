const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    deleteUser,
    getUserById,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

// ================================
//  REGISTRO (con archivos reales)
// ================================
router.post(
    "/register",
    upload.any(),
    registerUser
);

// LOGIN
router.post("/login", loginUser);

// PERFIL
router.get("/profile", protect, getProfile);

// ACTUALIZAR PERFIL
router.put("/update", protect, updateProfile);

// ELIMINAR USUARIO
router.delete("/:id", protect, deleteUser);

// ================================
//  ADMIN SISTEMA - GESTIÓN USUARIOS
// ================================

// Obtener usuarios "pendientes"
router.get("/", protect, adminOnly, async (req, res) => {
    try {
        const users = await require("../models/User").find({
            estadoRegistro: "pendiente"
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
});

// Obtener detalles de un usuario
router.get("/:id", protect, adminOnly, async (req, res) => {
    try {
        const user = await require("../models/User").findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error interno" });
    }
});

// Cambiar estado (aprobar/rechazar)
router.put("/:id/estado", protect, adminOnly, async (req, res) => {
    try {
        const user = await require("../models/User").findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        user.estadoRegistro = req.body.estado; // <-- CAMBIO CORRECTO
        await user.save();

        res.json({ message: `Usuario ${req.body.estado}`, user });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar estado" });
    }
});

module.exports = router;