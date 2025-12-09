const API_URL = 'http://localhost:3001/api';

export const api = {
    // Test DB Connection
    checkDbConnection: async () => {
        try {
            const response = await fetch(`${API_URL}/test-db`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return await response.json();
        } catch (error) {
            console.error('Error verificando conexión:', error);
            throw error;
        }
    },
};
