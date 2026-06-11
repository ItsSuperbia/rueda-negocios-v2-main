const { body, validationResult } = require("express-validator");

// 📌 Validaciones para registro de usuario
exports.validateRegister = [
    body("email")
        .isEmail()
        .withMessage("El correo electrónico no es válido"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),

    body("role")
        .isIn(["adminSistema", "adminEvento", "ofertante", "demandante"])
        .withMessage("El rol no es válido"),

    body("nombreEmpresa").custom((value, { req }) => {
        const role = req.body.role;
        if (role === "adminSistema" || role === "adminEvento") {
            return true;
        }
        if (!value) {
            throw new Error("El nombre de la empresa es obligatorio");
        }
        return true;
    }),

    body("sector")
        .if(body("role").not().equals("adminSistema"))
        .notEmpty()
        .withMessage("El sector es obligatorio"),

    body("formalizada")
        .if(body("role").not().equals("adminSistema"))
        .isBoolean()
        .withMessage("El campo 'formalizada' debe ser verdadero o falso"),

    body("aceptaTerminos")
        .custom((value) => value === "true" || value === "on" || value === true)
        .withMessage("Debe aceptar los términos y condiciones"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }
        next();
    },
];

// 📌 Validaciones para actualización de usuario
exports.validateUpdateUser = [
    // Campos no modificables
    body("email").not().exists().withMessage("El correo no se puede modificar"),
    body("password").not().exists().withMessage("La contraseña no se puede modificar"),
    body("role").not().exists().withMessage("El rol no se puede modificar"),
    body("nit").not().exists().withMessage("El NIT no se puede modificar"),
    body("rutProvisional").not().exists().withMessage("El RUT provisional no se puede modificar"),

    // Campos opcionales (si se envían, deben ser válidos)
    body("nombreEmpresa")
        .optional()
        .notEmpty()
        .withMessage("El nombre de la empresa no puede estar vacío"),

    body("logoEmpresa")
        .optional()
        .isString()
        .withMessage("La ruta del logo debe ser texto"),

    body("sector")
        .optional()
        .notEmpty()
        .withMessage("El sector no puede estar vacío"),

    body("formalizada")
        .optional()
        .isBoolean()
        .withMessage("El campo 'formalizada' debe ser booleano"),

    // Validar datos de contacto
    body("datosContacto.correo")
        .optional()
        .isEmail()
        .withMessage("El correo de contacto no es válido"),

    body("datosContacto.telefono")
        .optional()
        .isString()
        .withMessage("El teléfono debe ser texto"),

    // Validar representante
    body("representante.nombre")
        .optional()
        .isString()
        .withMessage("El nombre del representante debe ser texto"),

    body("representante.documento")
        .optional()
        .isString()
        .withMessage("El documento del representante debe ser texto"),

    // Validar documentos
    body("documentosFormalizados")
        .optional()
        .isObject()
        .withMessage("Los documentos formalizados deben tener formato de objeto"),

    // Capturar errores
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }
        next();
    },
];
