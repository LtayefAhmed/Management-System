const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Test de connexion
router.get('/test', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const result = await connection.execute('SELECT 1 FROM dual');
        res.json({ success: true, message: 'Connexion Oracle établie' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await db.closeConnection(connection);
    }
});

// Ajouter un article
router.post('/ajouter', async (req, res) => {
    let connection;
    try {
        const { designation, prixA, prixV, codetva, categorie, qtestk } = req.body;
        
        if (!designation || !prixA || !prixV || !codetva) {
            return res.status(400).json({ 
                success: false, 
                error: 'Champs requis manquants' 
            });
        }

        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DECLARE
                v_refart CHAR(4);
            BEGIN
                pkg_gestion_articles.ajouter_article(
                    :designation, :prixA, :prixV, :codetva, 
                    :categorie, :qtestk, v_refart
                );
                :refart := v_refart;
            END;`,
            {
                designation: designation,
                prixA: parseFloat(prixA),
                prixV: parseFloat(prixV),
                codetva: parseInt(codetva),
                categorie: categorie || null,
                qtestk: qtestk ? parseInt(qtestk) : 0,
                refart: { dir: db.oracledb.BIND_OUT, type: db.oracledb.STRING, maxSize: 4 }
            }
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            refart: result.outBinds.refart,
            message: 'Article ajouté avec succès'
        });
        
    } catch (error) {
        console.error('Erreur ajout article:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Chercher des articles
router.get('/chercher', async (req, res) => {
    let connection;
    try {
        const { refart, designation, categorie } = req.query;
        console.log('API /articles/chercher called with params:', { refart, designation, categorie });
        
        connection = await db.getConnection();
        
        const result = await connection.execute(
            `DECLARE
                v_cursor SYS_REFCURSOR;
            BEGIN
                v_cursor := pkg_gestion_articles.chercher_article(
                    :refart, :designation, :categorie
                );
                :result := v_cursor;
            END;`,
            {
                refart: refart || null,
                designation: designation || null,
                categorie: categorie || null,
                result: { dir: db.oracledb.BIND_OUT, type: db.oracledb.CURSOR }
            }
        );
        
        const resultSet = result.outBinds.result;
        const rows = await resultSet.getRows();
        console.log('chercher: fetched rows count=', rows?.length);
        if (rows && rows.length > 0) console.log('first row sample=', rows[0]);
        await resultSet.close();

        // If stored proc returned nothing, fallback to a direct SELECT (covers rows inserted directly via SQL Developer)
        let finalRows = rows;
        if ((!rows || rows.length === 0)) {
            console.log('chercher: no rows from package, falling back to direct SELECT from articles table');
            const selectResult = await connection.execute(
                `SELECT refart, designation, prixA, prixV, codetva, categorie, qtestk FROM articles`
            );
            finalRows = selectResult.rows || [];
            console.log('direct SELECT rows count=', finalRows.length);
        }

        // Formater les résultats
        const articles = (finalRows || []).map(row => ({
            refart: typeof row[0] === 'string' ? row[0].trim() : row[0],
            designation: row[1],
            prixA: row[2],
            prixV: row[3],
            codetva: row[4],
            categorie: row[5],
            qtestk: row[6]
        }));

        res.json({ 
            success: true, 
            articles 
        });
        
    } catch (error) {
        console.error('Erreur recherche article:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Supprimer un article
router.delete('/supprimer/:refart', async (req, res) => {
    let connection;
    try {
        const { refart } = req.params;
        
        if (!refart) {
            return res.status(400).json({ 
                success: false, 
                error: 'Référence article requise' 
            });
        }

        connection = await db.getConnection();
        const ref = typeof refart === 'string' ? refart.trim() : refart;

        await connection.execute(
            `BEGIN
                pkg_gestion_articles.supprimer_article(:refart);
            END;`,
            { refart: { dir: db.oracledb.BIND_IN, val: ref, type: db.oracledb.STRING } }
        );
        
        await connection.commit();
        
        res.json({ 
            success: true, 
            message: 'Article supprimé avec succès'
        });
        
    } catch (error) {
        console.error('Erreur suppression article:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    } finally {
        await db.closeConnection(connection);
    }
});

// Modifier un article
router.put('/modifier/:refart', async (req, res) => {
    let connection;
    try {
        const { refart } = req.params;
        const { designation, prixA, prixV, codetva, categorie, qtestk } = req.body;

        if (!refart) {
            return res.status(400).json({ success: false, error: 'Référence article requise' });
        }

        // Préparer les valeurs (null si non fournies)
        const p_designation = designation !== undefined && designation !== '' ? designation : null;
        const p_prixA = prixA !== undefined && prixA !== '' ? parseFloat(prixA) : null;
        const p_prixV = prixV !== undefined && prixV !== '' ? parseFloat(prixV) : null;
        const p_codetva = codetva !== undefined && codetva !== '' ? parseInt(codetva) : null;
        const p_categorie = categorie !== undefined && categorie !== '' ? categorie : null;
        const p_qtestk = qtestk !== undefined && qtestk !== '' ? parseInt(qtestk) : null;

        connection = await db.getConnection();
        const ref = typeof refart === 'string' ? refart.trim() : refart;

        await connection.execute(
            `BEGIN
                pkg_gestion_articles.modifier_article(
                    :refart, :designation, :prixA, :prixV, :codetva, :categorie, :qtestk
                );
            END;`,
            {
                refart: { dir: db.oracledb.BIND_IN, val: ref, type: db.oracledb.STRING },
                designation: p_designation,
                prixA: p_prixA,
                prixV: p_prixV,
                codetva: p_codetva,
                categorie: p_categorie,
                qtestk: p_qtestk
            }
        );

        await connection.commit();

        res.json({ success: true, message: `Article ${refart} modifié avec succès` });

    } catch (error) {
        console.error('Erreur modification article:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await db.closeConnection(connection);
    }
});

module.exports = router;