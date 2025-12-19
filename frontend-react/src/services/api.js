import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
    response => response,
    error => {
        // Normaliser l'erreur pour que le frontend puisse l'afficher proprement
        const normalized = {
            message: error.response?.data?.message || error.response?.data?.error || error.message || 'Erreur réseau',
            details: error.response?.data || null,
            status: error.response?.status || null
        };
        console.error('API Error:', normalized);
        return Promise.reject(normalized);
    }
);

export const checkApiConnection = async () => {
    try {
        const response = await api.get('/articles/test');
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.message || (error && typeof error === 'string' ? error : 'API non disponible'),
            details: error.details || null
        };
    }
};

export default api;