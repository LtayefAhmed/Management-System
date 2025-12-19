import api from './api';

export const ligcdeService = {
    async ajouterLigcde(nocde, refart, qtecde) {
        try {
            const response = await api.post('/ligcdes/ajouter', { 
                nocde, 
                refart, 
                qtecde 
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async chercherLigcdesCommande(nocde) {
        try {
            const response = await api.get(`/ligcdes/commande/${nocde}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async supprimerLigcde(nocde, refart) {
        try {
            const response = await api.delete(`/ligcdes/supprimer/${nocde}/${refart}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
