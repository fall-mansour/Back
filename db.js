
// backend/db.js
const mysql = require('mysql2/promise'); // version promise pour async/await
require('dotenv').config();

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password:'',
  database:'secondlife',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tester la connexion au démarrage
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Connecté à la base de données MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Impossible de se connecter à la base de données MySQL :');
    console.error(err.message);
    process.exit(1); // quitte le serveur si la connexion échoue
  }
})();

module.exports = db;
