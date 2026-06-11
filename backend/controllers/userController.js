const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔑 Generar token JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


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
            sector: req.body.sector || null,
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
            catalogoPDF: getFile("catalogoFile"),
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
        const sector = req.body.sector;
        const formalizadaProvided = typeof req.body.formalizada !== "undefined";
        const formalizadaValue = req.body.formalizada === "true" || req.body.formalizada === true;
        const datosContacto = parseJson(req.body.datosContacto);
        const representante = parseJson(req.body.representante);
        const rutFile = getFile("rutFile");
        const logoFile = getFile("logoEmpresa");
        const catalogoFile = getFile("catalogoFile");

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
        if (logoFile) user.logoEmpresa = logoFile;
        if (sector) user.sector = sector;
        if (datosContacto) user.datosContacto = { ...user.datosContacto, ...datosContacto };
        if (catalogoFile && user.role === "ofertante") user.catalogoPDF = catalogoFile;

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
