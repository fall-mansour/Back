


const mysql = require('mysql2/promise');
require('dotenv').config(); // charge le fichier .env

const db = mysql.createPool({
  host: process.env.DB_HOST, // ✅ variable d'environnement réelle
  port: process.env.DB_PORT, // ✅ idem
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // obligatoire pour Aiven
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
