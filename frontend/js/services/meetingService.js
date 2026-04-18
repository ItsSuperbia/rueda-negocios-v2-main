const API_URL = "http://localhost:4000/api";

const meetingService = {
    // Agendar reunión
    scheduleMeeting: async (data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/meetings`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Error agendando cita");
            }

            return await response.json();
        } catch (error) {
            console.error("Error agendando reunión:", error);
            throw error;
        }
    },

    // Obtener agenda
    getSchedule: async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/meetings`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            return await response.json();
        } catch (error) {
            console.error("Error obteniendo agenda:", error);
            return [];
        }
    }
};
