const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialiser Oracle Client avec chemin instantclient
try {
    const libDir = process.env.ORACLE_LIB_DIR || 'C:\\instantclient_21_19';
    oracledb.initOracleClient({ libDir });
    console.log('✅ Oracle Client initialisé');
} catch (err) {
    console.warn('⚠️  Avertissement Oracle Client:', err.message);
    console.log('📝 Continuant en mode sans connexion Oracle...');
}

// Configuration Oracle
const dbConfig = {
    user: process.env.ORACLE_USER || "system",
    password: process.env.ORACLE_PASSWORD || "admin123",
    connectString: process.env.ORACLE_CONNECT_STRING || "localhost:1521/xe"
};

// Initialiser le pool de connexions
async function initialize() {
    try {
        console.log('🔄 Tentative de connexion à Oracle...');
        await oracledb.createPool({
            ...dbConfig,
            poolMin: 1,
            poolMax: 10,
            poolIncrement: 1,
            poolTimeout: 60
        });
        console.log('✅ Pool de connexion Oracle créé');
        return true;
    } catch (err) {
        console.error('❌ Erreur de connexion Oracle:', err.message);
        console.log('⚠️  Les routes peuvent ne pas fonctionner sans Oracle');
        return false;
    }
}

// Obtenir une connexion
async function getConnection() {
    try {
        return await oracledb.getConnection();
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        throw err;
    }
}

// Libérer une connexion
async function closeConnection(connection) {
    try {
        if (connection) {
            await connection.close();
        }
    } catch (err) {
        console.error('Erreur lors de la fermeture:', err);
    }
}

module.exports = {
    oracledb,
    initialize,
    getConnection,
    closeConnection
};