require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const path = require("path");

// Conectar a MongoDB
connectDB();

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // expone carpeta uploads
app.use("/api/uploads", require("./routes/uploadRoutes"));

// Rutas
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/meetings", require("./routes/meetingRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("Bienvenido al backend de Rueda de Negocios 🚀");
});

app.use("/api/eventos", require("./routes/eventoRoutes"));

// Ruta de prueba (para verificar servidor)
app.get("/api", (req, res) => {
    res.send("🚀 API Rueda de Negocios funcionando correctamente");
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
    console.log(`🔥 Servidor backend corriendo en http://localhost:${PORT}`)
);
