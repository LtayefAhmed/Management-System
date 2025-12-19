import api from './api';

export const commandeService = {
    async ajouterCommande(noclt) {
        try {
            const response = await api.post('/commandes/ajouter', { noclt });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async modifierEtatCommande(nocde, nouvel_etat) {
        try {
            const response = await api.put('/commandes/modifier-etat', { 
                nocde, 
                nouvel_etat 
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async annulerCommande(nocde) {
        try {
            const response = await api.post('/commandes/annuler', { nocde });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async chercherCommandes(params = {}) {
        try {
            const response = await api.get('/commandes/chercher', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};