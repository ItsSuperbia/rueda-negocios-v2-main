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
            return file ? file.path : null;
        };


        if (!req.body) req.body = {};

        // convertir "on" → true/false
        req.body.aceptaTerminos = req.body.aceptaTerminos === "on";

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
            logoEmpresa: getFile(req.files, "logoEmpresa"),

            // NO FORMALIZADA
            rutProvisional: req.body.rutProvisional || null,
            rutProvisionalFile: getFile(req.files, "rutProvisionalFile"),
            comprobanteMatricula: getFile(req.files, "comprobanteMatricula"),
            cedulaSolicitanteFile: getFile(req.files, "cedulaSolicitanteFile"),

            // FORMALIZADA
            nit: req.body.nit || null,
            rutFile: getFile(req.files, "rutFile"),
            certificadoExistenciaFile: getFile(req.files, "certificadoExistenciaFile"),
            cedulaRepresentanteFile: getFile(req.files, "cedulaRepresentanteFile"),

            // Catálogos PDF
            catalogoPDF: getFile(req.files, "catalogoFile"),
            necesidadesPDF: getFile(req.files, "necesidadesFile"),

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

        const {
            nombreEmpresa,
            logoEmpresa,
            sector,
            formalizada,
            datosContacto,
            representante,
            documentosFormalizados,
            documentosNoFormalizados,
            catalogoPDF,
            necesidadesPDF
        } = req.body;

        // ⚠️ No se pueden cambiar estos campos
        if (req.body.email || req.body.password || req.body.role || req.body.nit || req.body.rutProvisional) {
            return res.status(400).json({ message: "No se puede modificar email, password, rol, NIT o RUT provisional" });
        }

        // 🔐 Verificar cambio de formalización
        if (user.formalizada && formalizada === false) {
            return res.status(400).json({
                message: "No se puede cambiar de empresa formalizada a no formalizada"
            });
        }

        // 📁 Si cambia de no formalizada a formalizada → debe enviar documentos formalizados
        if (!user.formalizada && formalizada === true) {
            if (
                !documentosFormalizados ||
                !documentosFormalizados.rut ||
                !documentosFormalizados.certificadoExistencia ||
                !documentosFormalizados.cedulaRepresentante
            ) {
                return res.status(400).json({
                    message: "Debe adjuntar los documentos de empresa formalizada (RUT, certificado y cédula representante)"
                });
            }
            user.formalizada = true;
            user.documentosFormalizados = documentosFormalizados;
            user.documentosNoFormalizados = {};
        }

        // 🧑‍💼 Si cambia el representante, se debe enviar nueva cédula
        if (representante) {
            const nombreCambia = representante.nombre && representante.nombre !== user.representante.nombre;
            const documentoCambia = representante.documento && representante.documento !== user.representante.documento;

            if ((nombreCambia || documentoCambia) && (!documentosFormalizados || !documentosFormalizados.cedulaRepresentante)) {
                return res.status(400).json({
                    message: "Debe adjuntar nuevamente la cédula del representante si cambia el nombre o documento"
                });
            }

            user.representante = { ...user.representante, ...representante };
        }

        // ✅ Actualizar los campos permitidos
        if (nombreEmpresa) user.nombreEmpresa = nombreEmpresa;
        if (logoEmpresa) user.logoEmpresa = logoEmpresa;
        if (sector) user.sector = sector;
        if (datosContacto) user.datosContacto = { ...user.datosContacto, ...datosContacto };
        if (catalogoPDF) user.catalogoPDF = catalogoPDF;
        if (necesidadesPDF) user.necesidadesPDF = necesidadesPDF;

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
