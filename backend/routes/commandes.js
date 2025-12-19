const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Ajouter une commande
router.post('/ajouter', async (req, res) => {
    let connection;
    try {
        const { noclt } = req.body;
        
        if (!noclt) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro client requis' 
            });
        }

        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DECLARE
                v_nocde NUMBER;
            BEGIN
                pkg_gestion_commandes.ajouter_commande(:noclt, v_nocde);
                :nocde := v_nocde;
            END;`,
            {
                noclt: parseInt(noclt),
                nocde: { dir: db.oracledb.BIND_OUT, type: db.oracledb.NUMBER }
            }
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            nocde: result.outBinds.nocde,
            message: 'Commande ajoutée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur ajout commande:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Modifier état d'une commande
router.put('/modifier-etat', async (req, res) => {
    let connection;
    try {
        const { nocde, nouvel_etat } = req.body;
        
        if (!nocde || !nouvel_etat) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande et nouvel état requis' 
            });
        }

        connection = await db.getConnection();
        
        // If transitioning to PR, verify the commande has at least 1 article
        if (nouvel_etat === 'PR') {
            const articleCheck = await connection.execute(
                `SELECT COUNT(*) as cnt FROM ligcdes WHERE nocde = :nocde`,
                { nocde: parseInt(nocde) },
                { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
            );
            
            const artCount = articleCheck.rows && articleCheck.rows[0] ? (articleCheck.rows[0].CNT || articleCheck.rows[0].cnt) : 0;
            if (artCount === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'La commande doit contenir au moins un article pour passer en état Prête (PR)' 
                });
            }
        }
        
        await connection.execute(
            `BEGIN
                pkg_gestion_commandes.modifier_etat(:nocde, :nouvel_etat);
            END;`,
            {
                nocde: parseInt(nocde),
                nouvel_etat: nouvel_etat
            }
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'État de commande modifié avec succès'
        });
        
    } catch (error) {
        console.error('Erreur modification état:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Annuler une commande
router.post('/annuler', async (req, res) => {
    let connection;
    try {
        const { nocde } = req.body;
        
        if (!nocde) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande requis' 
            });
        }

        connection = await db.getConnection();
        
        await connection.execute(
            `BEGIN
                pkg_gestion_commandes.annuler_commande(:nocde);
            END;`,
            {
                nocde: parseInt(nocde)
            }
        );
        
        await connection.commit();

        // Return updated commande state
        const cmd = await connection.execute(
            `SELECT nocde, etatcde FROM commandes WHERE nocde = :nocde`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const commande = cmd.rows && cmd.rows[0] ? cmd.rows[0] : null;

        res.json({ 
            success: true, 
            message: 'Commande annulée avec succès',
            commande
        });
        
    } catch (error) {
        console.error('Erreur annulation commande:', error);
        const msg = error.message || '';
        // Extract user-friendly message from Oracle errors
        if (msg.includes('ORA-20011')) {
            return res.status(400).json({ success: false, error: 'Impossible d\'annuler une commande dans cet état.' });
        }
        if (msg.includes('ORA-20013')) {
            return res.status(400).json({ success: false, error: 'Une livraison existe. Annulez la livraison via le module livraison.' });
        }
        res.status(500).json({ 
            success: false, 
            error: msg 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Chercher des commandes
router.get('/chercher', async (req, res) => {
    let connection;
    try {
        const { nocde, noclt, date } = req.query;
        
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DECLARE
                v_cursor SYS_REFCURSOR;
            BEGIN
                v_cursor := pkg_gestion_commandes.chercher_commande(
                    :nocde, :noclt, :date
                );
                :result := v_cursor;
            END;`,
            {
                nocde: nocde ? parseInt(nocde) : null,
                noclt: noclt ? parseInt(noclt) : null,
                date: date ? new Date(date) : null,
                result: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
            }
        );
        
        const resultSet = result.outBinds.result;
        const rows = await resultSet.getRows();
        await resultSet.close();
        
        // Formater les résultats
        const commandes = rows.map(row => ({
            nocde: row[0],
            noclt: row[1],
            datecde: row[2],
            etatcde: row[3]
        }));
        
        res.json({ 
            success: true, 
            commandes 
        });
        
    } catch (error) {
        console.error('Erreur recherche commande:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

module.exports = router;