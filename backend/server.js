const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Routes
const articlesRoutes = require('./routes/articles');
const commandesRoutes = require('./routes/commandes');
const livraisonsRoutes = require('./routes/livraisons');
const ligcdesRoutes = require('./routes/ligcdes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/articles', articlesRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/livraisons', livraisonsRoutes);
app.use('/api/ligcdes', ligcdesRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Systeme de Gestion - Soutenance',
        endpoints: {
            articles: '/api/articles',
            commandes: '/api/commandes',
            livraisons: '/api/livraisons'
        }
    });
});

// Gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Erreur interne du serveur' 
    });
});

// Initialiser et démarrer
async function startServer() {
    try {
        const dbInitialized = await db.initialize();
        
        if (!dbInitialized) {
            console.warn('⚠️  Oracle non connecté - Les routes peuvent ne pas fonctionner');
            console.log('💡 Assurez-vous que:');
            console.log('   1. Oracle est en cours d\'exécution (lsnrctl status)');
            console.log('   2. L\'instantclient est correctement installé');
            console.log('   3. Les variables d\'environnement sont configurées');
        }
        
        app.listen(PORT, () => {
            console.log(`\n✅ Serveur démarré sur http://localhost:${PORT}`);
            console.log(`📊 API Articles: http://localhost:${PORT}/api/articles`);
            console.log(`📦 API Commandes: http://localhost:${PORT}/api/commandes`);
            console.log(`🚚 API Livraisons: http://localhost:${PORT}/api/livraisons`);
            console.log(`\n📝 Test API: http://localhost:${PORT}/api/articles/test`);
            console.log(`\n🎯 Prêt pour la soutenance !\n`);
        });
    } catch (error) {
        console.error('❌ Erreur démarrage serveur:', error);
        process.exit(1);
    }
}

startServer();