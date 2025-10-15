const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// === Middleware ===
app.use(cors()); // Pour autoriser toutes les origines, peut être restreint si besoin
app.use(express.json());

// === Logger simple ===
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// === Importation des routes ===
const connexionRoutes = require('./routes/connexion');
const aideRoutes = require('./routes/objetsaides');
const venteRoutes = require('./routes/ventes');
const pubaidesRoutes = require('./routes/pubaides');
const pubventesRoutes = require('./routes/pubventes');
const compteRoutes = require('./routes/compte');
const infosRoutes = require('./routes/infos');
const passwordRoutes = require('./routes/password');
const histoventesRoutes = require('./routes/histoventes');
const histoaidesRoutes = require('./routes/histoaides');

// === Montage des routes ===
app.use('/api/connexion', connexionRoutes);
app.use('/api/objetsaides', aideRoutes);
app.use('/api/ventes', venteRoutes);
app.use('/api/pubaides', pubaidesRoutes);
app.use('/api/pubventes', pubventesRoutes);
app.use('/api/compte', compteRoutes);
app.use('/api/infos', infosRoutes);
app.use('/api/histoaides', histoaidesRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/histoventes', histoventesRoutes);

// === Dossier uploads static ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Route test simple ===
app.get('/', (req, res) => {
  res.send('✅ Serveur backend SecondLife opérationnel');
});

// === Lancement du serveur avec port dynamique pour Render ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur le port ${PORT}`);
});
