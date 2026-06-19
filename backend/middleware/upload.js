const fs = require('fs');
const multer = require('multer');
const path = require('path');

const sanitizeFilename = (name) => {
    const ext = path.extname(name).toLowerCase();
    const base = path.basename(name, ext);
    const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 60) || "file";
    return `${Date.now()}-${safeBase}${ext}`;
};

const maxFileSizeMb = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB || process.env.MAX_CATALOG_PDF_SIZE_MB || 5);

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // carpeta donde se guardan archivos
    },
    filename: (req, file, cb) => {
        cb(null, sanitizeFilename(file.originalname));
    },
});

// Filtros de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
};

// Exportar el middleware
module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 }
});
