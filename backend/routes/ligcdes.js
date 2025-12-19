const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Ajouter une ligne de commande (article à une commande)
router.post('/ajouter', async (req, res) => {
    let connection;
    try {
        const { nocde, refart, qtecde } = req.body;
        
        if (!nocde || !refart || !qtecde) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande, référence article et quantité requis' 
            });
        }

        if (qtecde <= 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'La quantité doit être positive' 
            });
        }

        connection = await db.getConnection();
        
        // Check if commande exists and its state
        const cmdCheck = await connection.execute(
            `SELECT nocde, etatcde FROM commandes WHERE nocde = :nocde`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        if (!cmdCheck.rows || cmdCheck.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Commande introuvable' 
            });
        }

        // Can only add articles if commande is in state EC (En cours)
        const etat = cmdCheck.rows[0].ETATCDE || cmdCheck.rows[0].etatcde;
        if (etat !== 'EC') {
            return res.status(400).json({ 
                success: false, 
                error: `Impossible d'ajouter des articles: la commande est en état '${etat}'. Elle doit être en cours (EC).` 
            });
        }

        // Check if article exists
        const artCheck = await connection.execute(
            `SELECT refart FROM articles WHERE refart = :refart`,
            { refart: refart.trim() },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        if (!artCheck.rows || artCheck.rows.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Article introuvable' 
            });
        }

        // Check if this article is already in this commande
        const existCheck = await connection.execute(
            `SELECT nocde, refart FROM ligcdes WHERE nocde = :nocde AND refart = :refart`,
            { nocde: parseInt(nocde), refart: refart.trim() },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        if (existCheck.rows && existCheck.rows.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cet article est déjà présent dans cette commande' 
            });
        }

        // Insert into ligcdes
        await connection.execute(
            `INSERT INTO ligcdes (nocde, refart, qtecde)
             VALUES (:nocde, :refart, :qtecde)`,
            {
                nocde: parseInt(nocde),
                refart: refart.trim(),
                qtecde: parseFloat(qtecde)
            }
        );

        await connection.commit();

        // Return the inserted row
        const inserted = await connection.execute(
            `SELECT nocde, refart, qtecde FROM ligcdes WHERE nocde = :nocde AND refart = :refart`,
            { nocde: parseInt(nocde), refart: refart.trim() },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const ligcde = inserted.rows && inserted.rows[0] ? inserted.rows[0] : null;

        res.json({ 
            success: true, 
            message: 'Article ajouté à la commande avec succès',
            ligcde
        });

    } catch (error) {
        console.error('Erreur ajout ligcde:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Chercher les articles d'une commande
router.get('/commande/:nocde', async (req, res) => {
    let connection;
    try {
        const { nocde } = req.params;
        
        if (!nocde) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande requis' 
            });
        }

        connection = await db.getConnection();
        
        const result = await connection.execute(
            `SELECT lc.nocde, lc.refart, lc.qtecde, a.designation, a.prixV
             FROM ligcdes lc
             JOIN articles a ON lc.refart = a.refart
             WHERE lc.nocde = :nocde
             ORDER BY lc.refart`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const ligcdes = result.rows || [];

        res.json({ 
            success: true, 
            ligcdes
        });

    } catch (error) {
        console.error('Erreur recherche ligcdes:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Supprimer un article d'une commande
router.delete('/supprimer/:nocde/:refart', async (req, res) => {
    let connection;
    try {
        const { nocde, refart } = req.params;
        
        if (!nocde || !refart) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande et référence article requis' 
            });
        }

        connection = await db.getConnection();
        
        const del = await connection.execute(
            `DELETE FROM ligcdes WHERE nocde = :nocde AND refart = :refart`,
            { nocde: parseInt(nocde), refart: refart.trim() }
        );

        if (del.rowsAffected === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ligne de commande introuvable' 
            });
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: 'Article supprimé de la commande'
        });

    } catch (error) {
        console.error('Erreur suppression ligcde:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

module.exports = router;
