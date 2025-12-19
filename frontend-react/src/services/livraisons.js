import api from './api';

export const livraisonService = {
    async ajouterLivraison(livraisonData) {
        try {
            const response = await api.post('/livraisons/ajouter', livraisonData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async chercherLivraisons(params = {}) {
        try {
            const response = await api.get('/livraisons/chercher', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async supprimerLivraison(nocde, dateliv) {
        try {
            const response = await api.delete(`/livraisons/supprimer/${nocde}/${dateliv}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async modifierLivraison(nocde, dateliv, nouvelleDate, nouveauLivreur) {
        try {
            const response = await api.put('/livraisons/modifier', {
                nocde,
                dateliv,
                nouvelle_date: nouvelleDate,
                nouveau_livreur: nouveauLivreur
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};