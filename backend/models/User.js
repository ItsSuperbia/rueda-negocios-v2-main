const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        // 🔐 Credenciales
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 6 },

        // 🎭 Rol del usuario
        role: {
            type: String,
            enum: ["adminSistema", "adminEvento", "ofertante", "demandante"],
            required: true,
        },

        // 🏢 Datos principales de la empresa
        nombreEmpresa: { type: String, required: function(){return this.role !== 'adminSistema'}},
        logoEmpresa: { type: String, default: "" }, // ruta de imagen
        sector: { type: String, required: function(){return this.role !== 'adminSistema'} },
        formalizada: { type: Boolean, required: function(){return this.role !== 'adminSistema'} },

        // ☎️ Datos de contacto
        datosContacto: {
            correo: { type: String, default: "" },
            telefono: { type: String, default: "" },
            direccion: { type: String, default: "" },
            redes: { type: [String], default: [] },
        },

        // 👤 Representante legal o encargado
        representante: {
            nombre: { type: String, default: "" },
            documento: { type: String, default: "" },
            cargo: { type: String, default: "" },
        },

        // 🧾 Identificación de empresa
        nit: { type: String },
        rutProvisional: { type: String },

        // 📄 Documentos (rutas o URLs)
        documentosFormalizados: {
            rut: { type: String, default: "" },
            certificadoExistencia: { type: String, default: "" },
            cedulaRepresentante: { type: String, default: "" },
        },

        documentosNoFormalizados: {
            comprobanteMatricula: { type: String, default: "" },
            cedulaSolicitante: { type: String, default: "" },
        },

        // 📘 PDFs comerciales
        catalogoPDF: { type: String, default: "" },
        necesidadesPDF: { type: String, default: "" },

        // ✅ Estado de registro
        aceptaTerminos: { type: Boolean, required: true },
        estadoRegistro: {
            type: String,
            enum: ["pendiente", "aprobado", "rechazado"],
            default: "pendiente",
        },
    },
    { timestamps: true }
);

// 🔐 Hash de contraseña antes de guardar
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// 🔍 Comparar contraseñas (para login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 🧹 Ocultar contraseña al devolver datos
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model("User", userSchema);
