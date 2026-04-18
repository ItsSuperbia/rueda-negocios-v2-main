const Match = require("../models/Match");
const User = require("../models/User");

// 🔍 Generar posibles matches (Lógica simple por sector)
exports.generateMatches = async (req, res) => {
    try {
        // 1. Obtener todos los ofertantes y demandantes
        const suppliers = await User.find({ role: "ofertante", formalizada: true });
        const buyers = await User.find({ role: "demandante" });

        let matchesCreated = 0;

        for (const buyer of buyers) {
            for (const supplier of suppliers) {
                // Lógica de emparejamiento: Mismo sector
                if (buyer.sector === supplier.sector) {
                    // Verificar si ya existe
                    const existingMatch = await Match.findOne({
                        supplierId: supplier._id,
                        buyerId: buyer._id,
                    });

                    if (!existingMatch) {
                        await Match.create({
                            supplierId: supplier._id,
                            buyerId: buyer._id,
                            score: 80, // Score base por coincidencia de sector
                            status: "pending",
                        });
                        matchesCreated++;
                    }
                }
            }
        }

        res.json({ message: `Se generaron ${matchesCreated} nuevos matches potenciales.` });

    } catch (error) {
        console.error("Error generando matches:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 📋 Obtener mis matches
exports.getMyMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let query = {};
        if (role === "ofertante") {
            query = { supplierId: userId };
        } else if (role === "demandante") {
            query = { buyerId: userId };
        } else if (role === "adminSistema" || role === "adminEvento") {
            // Admin ve todo
        } else {
            return res.status(403).json({ message: "Rol no autorizado" });
        }

        const matches = await Match.find(query)
            .populate("supplierId", "nombreEmpresa sector")
            .populate("buyerId", "nombreEmpresa sector");

        res.json(matches);

    } catch (error) {
        console.error("Error obteniendo matches:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ✅ Aceptar/Rechazar Match
exports.updateMatchStatus = async (req, res) => {
    try {
        const { matchId, status } = req.body; // status: 'accepted', 'rejected'

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match no encontrado" });

        // Solo el demandante o admin debería poder aceptar (regla de negocio común, o ambos)
        // Por simplicidad, permitimos a ambos por ahora
        match.status = status;
        await match.save();

        res.json({ message: `Match actualizado a ${status}`, match });

    } catch (error) {
        console.error("Error actualizando match:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
