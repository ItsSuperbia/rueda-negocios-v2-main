const User = require("../models/User");
const TableReservation = require("../models/TableReservation");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");

// 🔑 Generar token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const MAX_CATALOG_PDF_SIZE = Number(process.env.MAX_CATALOG_PDF_SIZE_MB || 5) * 1024 * 1024;

const buildCatalogoValue = (file) => ({
    nombreArchivo: file.originalname,
    url: file.path,
    fechaCarga: new Date()
});

const normalizeCatalogo = (catalogoPDF) => {
    if (!catalogoPDF) return null;
    if (typeof catalogoPDF === "string") {
        return catalogoPDF
            ? {
                nombreArchivo: path.basename(catalogoPDF),
                url: catalogoPDF,
                fechaCarga: null
            }
            : null;
    }

    return catalogoPDF;
};

const getCatalogoUrl = (catalogoPDF) => normalizeCatalogo(catalogoPDF)?.url ?? "";

const validateCatalogFile = (file) => {
    if (!file) {
        return "Debes adjuntar un archivo PDF";
    }

    if (file.mimetype !== "application/pdf" || path.extname(file.originalname).toLowerCase() !== ".pdf") {
        return "Solo se permiten archivos PDF";
    }

    if (file.size > MAX_CATALOG_PDF_SIZE) {
        return `El catálogo no puede superar ${Math.round(MAX_CATALOG_PDF_SIZE / (1024 * 1024))} MB`;
    }

    return null;
};

const safeCatalogPath = (filePath) => {
    const normalized = path.normalize(filePath);
    if (normalized.startsWith(`${path.sep}uploads${path.sep}`)) {
        return path.join(__dirname, "..", normalized);
    }
    if (normalized.startsWith(`uploads${path.sep}`)) {
        return path.join(__dirname, "..", normalized);
    }
    if (path.isAbsolute(normalized)) return normalized;
    return path.join(__dirname, "..", normalized);
};

const removeFileIfExists = (filePath) => {
    if (!filePath) return;
    const absolutePath = safeCatalogPath(filePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

const publicCompanyProfile = (user) => ({
    _id: String(user._id),
    nombreEmpresa: user.nombreEmpresa,
    logoEmpresa: user.logoEmpresa,
    descripcion: user.descripcion ?? "",
    sector: user.sector,
    ciudad: user.ciudad ?? "",
    pais: user.pais ?? "",
    representante: {
        nombre: user.representante?.nombre ?? "",
        cargo: user.representante?.cargo ?? ""
    },
    datosContacto: {
        correo: user.datosContacto?.correo || user.email,
        telefono: user.datosContacto?.telefono ?? "",
        direccion: user.datosContacto?.direccion ?? ""
    },
    catalogoPDF: normalizeCatalogo(user.catalogoPDF)
});


exports.registerUser = async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    
    try {
        req.files = req.files || []; // <-- SOLUCIÓN CLAVE

        const getFile = (field) => {
            const file = req.files?.find(f => f.fieldname === field);
            return file ? file.path : "";
        };


        if (!req.body) req.body = {};

        // convertir checkbox/strings a boolean
        const aceptaTerminosRaw = req.body.aceptaTerminos;
        req.body.aceptaTerminos = aceptaTerminosRaw === "on" || aceptaTerminosRaw === "true" || aceptaTerminosRaw === true;

        // construir objeto limpio de usuario
        const data = {
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,

            nombreEmpresa: req.body.nombreEmpresa || null,
            descripcion: req.body.descripcion || "",
            sector: req.body.sector || null,
            ciudad: req.body.ciudad || "",
            pais: req.body.pais || "Colombia",
            formalizada: req.body.formalizada === "true" || req.body.formalizada === true,
            aceptaTerminos: req.body.aceptaTerminos,

            // archivos
            logoEmpresa: getFile("logoEmpresa"),

            // NO FORMALIZADA
            rutProvisional: req.body.rutProvisional || null,
            documentosNoFormalizados: {
                comprobanteMatricula: getFile("comprobanteMatricula"),
                cedulaSolicitante: getFile("cedulaSolicitanteFile"),
            },

            // FORMALIZADA
            nit: req.body.nit || null,
            documentosFormalizados: {
                rut: getFile("rutFile"),
                certificadoExistencia: getFile("certificadoExistenciaFile"),
                cedulaRepresentante: getFile("cedulaRepresentanteFile"),
            },

            // Catálogos PDF
            catalogoPDF: (() => {
                const file = req.files?.find(f => f.fieldname === "catalogoFile");
                return file ? buildCatalogoValue(file) : null;
            })(),
            necesidadesPDF: getFile("necesidadesFile"),

            // estado inicial
            estadoRegistro: "pendiente"
        };

        // validar email
        if (!data.email) {
            return res.status(400).json({ message: "El email es obligatorio" });
        }

        // validar si existe email
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        // crear usuario correctamente
        const newUser = await User.create(data);

        const token = generateToken(newUser);

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            user: newUser,
            token,
        });

    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};



// 📌 Inicio de sesión
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        // Comparar contraseña
        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Contraseña incorrecta" });

        // Generar token
        const token = generateToken(user);

        res.json({
            message: "Inicio de sesión exitoso",
            user,
            token,
        });
    } catch (error) {
        console.error("❌ Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(user);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// 📌 Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 📌 Actualizar o completar perfil
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        req.files = req.files || [];

        const getFile = (field) => {
            const file = req.files?.find(f => f.fieldname === field);
            return file ? file.path : "";
        };

        const parseJson = (value) => {
            if (!value) return null;
            if (typeof value === "object") return value;
            try {
                return JSON.parse(value);
            } catch (error) {
                return null;
            }
        };

        const nombreEmpresa = req.body.nombreEmpresa;
        const descripcion = req.body.descripcion;
        const sector = req.body.sector;
        const ciudad = req.body.ciudad;
        const pais = req.body.pais;
        const formalizadaProvided = typeof req.body.formalizada !== "undefined";
        const formalizadaValue = req.body.formalizada === "true" || req.body.formalizada === true;
        const datosContacto = parseJson(req.body.datosContacto);
        const representante = parseJson(req.body.representante);
        const rutFile = getFile("rutFile");
        const logoFile = getFile("logoEmpresa");
        const catalogoFile = req.files?.find(f => f.fieldname === "catalogoFile");

        // ⚠️ No se pueden cambiar estos campos
        if (req.body.email || req.body.password || req.body.role || req.body.nit || req.body.rutProvisional) {
            return res.status(400).json({ message: "No se puede modificar email, password, rol, NIT o RUT provisional" });
        }

        // 🔐 Verificar cambio de formalización
        if (user.formalizada && formalizadaProvided && formalizadaValue === false) {
            return res.status(400).json({
                message: "No se puede cambiar de empresa formalizada a no formalizada"
            });
        }

        if (!user.formalizada && formalizadaProvided && formalizadaValue === true && !rutFile) {
            return res.status(400).json({
                message: "Debe adjuntar el RUT en PDF para formalizar la empresa"
            });
        }

        if (!user.formalizada && rutFile && (!formalizadaProvided || formalizadaValue !== true)) {
            return res.status(400).json({
                message: "El RUT solo se puede adjuntar si la empresa esta formalizada"
            });
        }

        if (!user.formalizada && formalizadaProvided && formalizadaValue === true) {
            user.formalizada = true;
            user.documentosFormalizados = {
                ...user.documentosFormalizados,
                rut: rutFile
            };
        }

        if (user.formalizada && rutFile) {
            user.documentosFormalizados = {
                ...user.documentosFormalizados,
                rut: rutFile
            };
        }

        if (representante) {
            user.representante = { ...user.representante, ...representante };
        }

        // ✅ Actualizar los campos permitidos
        if (nombreEmpresa) user.nombreEmpresa = nombreEmpresa;
        if (typeof descripcion !== "undefined") user.descripcion = descripcion;
        if (logoFile) user.logoEmpresa = logoFile;
        if (sector) user.sector = sector;
        if (typeof ciudad !== "undefined") user.ciudad = ciudad;
        if (typeof pais !== "undefined") user.pais = pais;
        if (datosContacto) user.datosContacto = { ...user.datosContacto, ...datosContacto };
        if (catalogoFile && user.role === "ofertante") {
            const catalogError = validateCatalogFile(catalogoFile);
            if (catalogError) {
                return res.status(400).json({ message: catalogError });
            }

            const previousCatalogUrl = getCatalogoUrl(user.catalogoPDF);
            user.catalogoPDF = buildCatalogoValue(catalogoFile);
            if (previousCatalogUrl && previousCatalogUrl !== catalogoFile.path) {
                removeFileIfExists(previousCatalogUrl);
            }
        }

        // Guardar cambios
        await user.save();

        res.status(200).json({
            message: "Perfil actualizado correctamente",
            user,
        });
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.uploadCatalogo = async (req, res) => {
    try {
        if (req.user.role !== "ofertante") {
            return res.status(403).json({ message: "Solo empresas ofertantes pueden cargar catálogo" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const file = req.file || req.files?.find((item) => item.fieldname === "catalogoFile");
        const validationError = validateCatalogFile(file);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const previousCatalogUrl = getCatalogoUrl(user.catalogoPDF);
        user.catalogoPDF = buildCatalogoValue(file);
        await user.save();

        if (previousCatalogUrl && previousCatalogUrl !== file.path) {
            removeFileIfExists(previousCatalogUrl);
        }

        res.json({
            message: "Catálogo actualizado correctamente",
            catalogoPDF: normalizeCatalogo(user.catalogoPDF),
            user
        });
    } catch (error) {
        console.error("❌ Error cargando catálogo:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.deleteCatalogo = async (req, res) => {
    try {
        if (req.user.role !== "ofertante") {
            return res.status(403).json({ message: "Solo el propietario puede eliminar su catálogo" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const previousCatalogUrl = getCatalogoUrl(user.catalogoPDF);
        user.catalogoPDF = null;
        await user.save();

        removeFileIfExists(previousCatalogUrl);

        res.json({ message: "Catálogo eliminado correctamente", user });
    } catch (error) {
        console.error("❌ Error eliminando catálogo:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.downloadCatalogo = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("catalogoPDF nombreEmpresa");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const catalogo = normalizeCatalogo(user.catalogoPDF);
        if (!catalogo?.url) {
            return res.status(404).json({ message: "Catálogo no disponible" });
        }

        const absolutePath = safeCatalogPath(catalogo.url);
        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ message: "Archivo no encontrado" });
        }

        res.download(absolutePath, catalogo.nombreArchivo || `${user.nombreEmpresa || "catalogo"}.pdf`);
    } catch (error) {
        console.error("❌ Error descargando catálogo:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.getPublicSupplierProfileForEvent = async (req, res) => {
    try {
        const supplier = await User.findOne({
            _id: req.params.id,
            role: "ofertante"
        }).select("-password -documentosFormalizados -documentosNoFormalizados -nit -rutProvisional -aceptaTerminos");

        if (!supplier) {
            return res.status(404).json({ message: "Empresa ofertante no encontrada" });
        }

        const reservation = await TableReservation.findOne({
            evento: req.params.eventoId,
            supplierId: supplier._id,
            status: "reserved"
        }).lean();

        if (!reservation) {
            return res.status(403).json({ message: "La empresa no está asociada a una mesa reservada en este evento" });
        }

        res.json(publicCompanyProfile(supplier));
    } catch (error) {
        console.error("❌ Error obteniendo perfil público:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


// 📌 Eliminar usuario (solo si es el mismo usuario o un admin)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Solo permitir eliminar su propia cuenta o si es admin
        if (req.user.role !== "adminSistema" && req.user.id !== userId) {
            return res
                .status(403)
                .json({ message: "No tienes permiso para eliminar este usuario" });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser)
            return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
