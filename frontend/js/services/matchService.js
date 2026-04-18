const API_URL = "http://localhost:4000/api";

const matchService = {
    // Obtener mis matches
    getMyMatches: async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/matches`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error obteniendo matches:", error);
            return [];
        }
    },

    // Actualizar estado (Aceptar/Rechazar)
    updateMatchStatus: async (matchId, status) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/matches/status`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ matchId, status })
            });
            return await response.json();
        } catch (error) {
            console.error("Error actualizando match:", error);
            throw error;
        }
    },

    // Generar matches (Admin)
    generateMatches: async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/matches/generate`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error generando matches:", error);
            throw error;
        }
    }
};
