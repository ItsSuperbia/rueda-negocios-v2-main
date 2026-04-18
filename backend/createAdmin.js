require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await connectDB();

    const adminData = {
        email: "admin@ruedanegocios.com",
        password: "admin123",
        role: "adminSistema",
        aceptaTerminos: true
    };

    try {
        // Verificar si ya existe
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log("⚠️  El admin ya existe");
            process.exit(0);
        }

        // Crear admin
        const admin = await User.create(adminData);
        console.log("✅ Admin creado exitosamente:");
        console.log("   Email:", adminData.email);
        console.log("   Password:", adminData.password);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error creando admin:", error);
        process.exit(1);
    }
};

createAdmin();
