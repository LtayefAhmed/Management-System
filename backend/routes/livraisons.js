const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper: parse a YYYY-MM-DD or ISO date input and return a Date at UTC noon
// Returns null if parsing fails
function parseDateToUTCNoon(input) {
    if (!input) return null;
    const dateStr = typeof input === 'string' ? input.split('T')[0] : input;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

// Ajouter une livraison
router.post('/ajouter', async (req, res) => {
    let connection;
    try {
        const { nocde, livreur, dateliv, modepay } = req.body;
        
        if (!nocde || !livreur || !dateliv) {
            return res.status(400).json({ 
                success: false, 
                error: 'Champs requis manquants' 
            });
        }

        // Parse date string - accept YYYY-MM-DD or ISO format and create a UTC-noon Date
        const dateObj = parseDateToUTCNoon(dateliv);
        if (!dateObj) {
            console.error('Date parsing failed for:', dateliv);
            return res.status(400).json({ 
                success: false, 
                error: 'Format de date invalide (attendu: YYYY-MM-DD ou ISO)' 
            });
        }

        connection = await db.getConnection();
        
        await connection.execute(
            `BEGIN
                pkg_gestion_livraisons.ajouter_livraison(
                    :nocde, :livreur, :dateliv, :modepay
                );
            END;`,
            {
                nocde: parseInt(nocde),
                livreur: parseInt(livreur),
                dateliv: dateObj,
                modepay: modepay || 'avant_livraison'
            }
        );

        await connection.commit();

        // Return the inserted livraison and current commande state
        const lv = await connection.execute(
            `SELECT nocde, dateliv, livreur, modepay, etatliv FROM LivraisonCom 
             WHERE nocde = :nocde AND TRUNC(dateliv) = TRUNC(:dateliv)`,
            { nocde: parseInt(nocde), dateliv: dateObj },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const cmd = await connection.execute(
            `SELECT nocde, etatcde FROM commandes WHERE nocde = :nocde`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const livraison = lv.rows && lv.rows[0] ? lv.rows[0] : null;
        const commande = cmd.rows && cmd.rows[0] ? cmd.rows[0] : null;

        res.json({ success: true, message: 'Livraison ajoutée avec succès', livraison, commande });
        
    } catch (error) {
        console.error('Erreur ajout livraison:', error);
        const msg = error.message || '';
        // Extract user-friendly messages from Oracle errors
        if (msg.includes('ORA-20020')) {
            return res.status(400).json({ success: false, error: 'La commande n\'est pas prête pour la livraison.' });
        }
        if (msg.includes('ORA-20021')) {
            return res.status(400).json({ success: false, error: 'Le livreur a déjà atteint le maximum de 15 livraisons pour ce jour et code postal.' });
        }
        if (msg.includes('ORA-20022')) {
            return res.status(400).json({ success: false, error: 'La date de livraison doit être aujourd\'hui ou une date future.' });
        }
        if (msg.includes('ORA-20023')) {
            return res.status(400).json({ success: false, error: 'Commande, client ou livreur non trouvé.' });
        }
        res.status(500).json({ 
            success: false, 
            error: msg 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Chercher des livraisons
router.get('/chercher', async (req, res) => {
    let connection;
    try {
        const { nocde, livreur, code_postal, date } = req.query;
        
        connection = await db.getConnection();
        
        // Parse date if provided - accept YYYY-MM-DD or ISO format (use UTC-noon)
        let dateObj = null;
        if (date) {
            dateObj = parseDateToUTCNoon(date);
            if (!dateObj) {
                console.error('Date parsing failed for:', date);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Format de date invalide (attendu: YYYY-MM-DD ou ISO)' 
                });
            }
        }
        
        const result = await connection.execute(
            `DECLARE
                v_cursor SYS_REFCURSOR;
            BEGIN
                v_cursor := pkg_gestion_livraisons.chercher_livraison(
                    :nocde, :livreur, :code_postal, :date
                );
                :result := v_cursor;
            END;`,
            {
                nocde: nocde ? parseInt(nocde) : null,
                livreur: livreur ? parseInt(livreur) : null,
                code_postal: code_postal ? parseInt(code_postal) : null,
                date: dateObj,
                result: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
            }
        );
        
        const resultSet = result.outBinds.result;
        const rows = await resultSet.getRows();
        await resultSet.close();
        
        // Formater les résultats
        const livraisons = rows.map(row => ({
            nocde: row[0],
            dateliv: row[1],
            livreur: row[2],
            modepay: row[3],
            etatliv: row[4]
        }));
        
        res.json({ 
            success: true, 
            livraisons 
        });
        
    } catch (error) {
        console.error('Erreur recherche livraison:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Supprimer une livraison
router.delete('/supprimer/:nocde/:dateliv', async (req, res) => {
    let connection;
    try {
        const { nocde, dateliv } = req.params;
        
        if (!nocde || !dateliv) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande et date requise' 
            });
        }

        // Parse date string (YYYY-MM-DD or ISO format from URL) to Date object (UTC-noon)
        const dateObj = parseDateToUTCNoon(dateliv);
        if (!dateObj) {
            console.error('Date parsing failed for:', dateliv);
            return res.status(400).json({ 
                success: false, 
                error: 'Format de date invalide (attendu: YYYY-MM-DD ou ISO)' 
            });
        }

        connection = await db.getConnection();

        await connection.execute(
            `BEGIN
                pkg_gestion_livraisons.supprimer_livraison(:nocde, :dateliv);
            END;`,
            {
                nocde: parseInt(nocde),
                dateliv: dateObj
            }
        );

        await connection.commit();

        // Return the updated livraison and commande state (trigger handles state sync)
        const lv = await connection.execute(
            `SELECT nocde, dateliv, livreur, modepay, etatliv FROM LivraisonCom 
             WHERE nocde = :nocde AND TRUNC(dateliv) = TRUNC(:dateliv)`,
            { nocde: parseInt(nocde), dateliv: dateObj },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const cmd = await connection.execute(
            `SELECT nocde, etatcde FROM commandes WHERE nocde = :nocde`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const livraison = lv.rows && lv.rows[0] ? lv.rows[0] : null;
        const commande = cmd.rows && cmd.rows[0] ? cmd.rows[0] : null;

        res.json({ success: true, message: 'Livraison supprimée avec succès', livraison, commande });
        
    } catch (error) {
        console.error('Erreur suppression livraison:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Modifier une livraison
router.put('/modifier', async (req, res) => {
    let connection;
    try {
        const { nocde, dateliv, nouvelle_date, nouveau_livreur } = req.body;
        
        if (!nocde || !dateliv) {
            return res.status(400).json({ 
                success: false, 
                error: 'Numéro commande et date requise' 
            });
        }

        // Parse date strings to Date objects - accept YYYY-MM-DD or ISO format (UTC-noon)
        const dateObj = parseDateToUTCNoon(dateliv);
        if (!dateObj) {
            console.error('Date parsing failed for dateliv:', dateliv);
            return res.status(400).json({ 
                success: false, 
                error: 'Format de date invalide pour dateliv (attendu: YYYY-MM-DD ou ISO)' 
            });
        }

        let newDateObj = null;
        if (nouvelle_date) {
            newDateObj = parseDateToUTCNoon(nouvelle_date);
            if (!newDateObj) {
                console.error('Date parsing failed for nouvelle_date:', nouvelle_date);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Format de date invalide pour nouvelle_date (attendu: YYYY-MM-DD ou ISO)' 
                });
            }
        }

        connection = await db.getConnection();
        
        await connection.execute(
            `BEGIN
                pkg_gestion_livraisons.modifier_livraison(
                    :nocde, :dateliv, :nouvelle_date, :nouveau_livreur
                );
            END;`,
            {
                nocde: parseInt(nocde),
                dateliv: dateObj,
                nouvelle_date: newDateObj,
                nouveau_livreur: nouveau_livreur ? parseInt(nouveau_livreur) : null
            }
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Livraison modifiée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur modification livraison:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

module.exports = router;

// Modifier l'état d'une livraison et synchroniser l'état de la commande
router.put('/modifier-etat', async (req, res) => {
    let connection;
    try {
        const { nocde, dateliv, etatliv } = req.body;

        if (!nocde || !dateliv || !etatliv) {
            return res.status(400).json({ success: false, error: 'nocde, dateliv et etatliv requis' });
        }

        const allowed = ['EC', 'LI', 'AL'];
        if (!allowed.includes(etatliv)) {
            return res.status(400).json({ success: false, error: `etatliv invalide (autorisé: ${allowed.join(',')})` });
        }

        const dateObj = parseDateToUTCNoon(dateliv);
        if (!dateObj) {
            return res.status(400).json({ success: false, error: 'Format de date invalide (attendu: YYYY-MM-DD ou ISO)' });
        }

        connection = await db.getConnection();

        // Update livraison state
        const upd = await connection.execute(
            `UPDATE LivraisonCom SET etatliv = :etatliv WHERE nocde = :nocde AND TRUNC(dateliv) = TRUNC(:dateliv)`,
            { etatliv, nocde: parseInt(nocde), dateliv: dateObj }
        );

        if (upd.rowsAffected === 0) {
            return res.status(400).json({ success: false, error: 'Livraison introuvable' });
        }

        // Synchronize commande state based on livraison state
        if (etatliv === 'LI') {
            await connection.execute(`UPDATE commandes SET etatcde = 'LI' WHERE nocde = :nocde`, { nocde: parseInt(nocde) });
        } else if (etatliv === 'AL') {
            await connection.execute(`UPDATE commandes SET etatcde = 'AL' WHERE nocde = :nocde`, { nocde: parseInt(nocde) });
        } else if (etatliv === 'EC') {
            // If livraison is back to en-cours, prefer to keep commande as PR if it was PR,
            // otherwise don't force a change here.
            const cmdRes = await connection.execute(
                `SELECT etatcde FROM commandes WHERE nocde = :nocde`,
                { nocde: parseInt(nocde) },
                { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
            );
            const current = cmdRes.rows && cmdRes.rows[0] ? (cmdRes.rows[0].ETATCDE || cmdRes.rows[0].etatcde) : null;
            if (current === 'PR') {
                // keep as PR
                await connection.execute(`UPDATE commandes SET etatcde = 'PR' WHERE nocde = :nocde`, { nocde: parseInt(nocde) });
            }
        }

        await connection.commit();

        // Return the updated livraison and commande states
        const lv = await connection.execute(
            `SELECT nocde, dateliv, livreur, modepay, etatliv FROM LivraisonCom WHERE nocde = :nocde AND TRUNC(dateliv) = TRUNC(:dateliv)`,
            { nocde: parseInt(nocde), dateliv: dateObj },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const cmd = await connection.execute(
            `SELECT nocde, etatcde FROM commandes WHERE nocde = :nocde`,
            { nocde: parseInt(nocde) },
            { outFormat: db.oracledb.OUT_FORMAT_OBJECT }
        );

        const livraison = lv.rows && lv.rows[0] ? lv.rows[0] : null;
        const commande = cmd.rows && cmd.rows[0] ? cmd.rows[0] : null;

        res.json({ success: true, livraison, commande });

    } catch (error) {
        console.error('Erreur modifier-etat livraison:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await db.closeConnection(connection);
    }
});