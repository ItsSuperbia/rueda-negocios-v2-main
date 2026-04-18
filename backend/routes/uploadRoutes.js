// backend/routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// Subida de un archivo
router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se subió ningún archivo" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        message: "Archivo subido correctamente",
        fileUrl,
    });
});

module.exports = router;

