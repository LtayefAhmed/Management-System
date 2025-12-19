import api from './api';

export const articleService = {
    async ajouterArticle(articleData) {
        try {
            const response = await api.post('/articles/ajouter', articleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async chercherArticles(params = {}) {
        try {
            const response = await api.get('/articles/chercher', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async supprimerArticle(refart) {
        try {
            const response = await api.delete(`/articles/supprimer/${refart}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
,

    async modifierArticle(refart, articleData) {
        try {
            const response = await api.put(`/articles/modifier/${refart}`, articleData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};