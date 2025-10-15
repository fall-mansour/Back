const db = require('../db');
const bcrypt = require('bcrypt');

exports.seConnecter = async (req, res) => {
  try {
    const { mail, password } = req.body;

    const [results] = await db.query('SELECT * FROM utilisateurs WHERE mail = ?', [mail]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email incorrect' });
    }

    const utilisateur = results[0];

    const passwordCorrect = await bcrypt.compare(password, utilisateur.password);
    if (!passwordCorrect) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    delete utilisateur.password;
    res.status(200).json({ message: 'Connexion réussie', utilisateur });
  } catch (err) {
    console.error('❌ Erreur dans seConnecter :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

