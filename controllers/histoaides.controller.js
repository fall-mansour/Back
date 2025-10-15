const db = require('../db'); // connexion MySQL
const fs = require('fs');
const path = require('path');

// 🔹 Récupérer l’historique des dons d’un utilisateur
exports.getHistoaides = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide ou non fourni' });
    }

    const [aides] = await db.execute(
      `SELECT a.id, a.description, a.quantite, a.image, a.created_at,
              u.nom, u.telephone, u.adresse
       FROM objetsaides a
       JOIN utilisateurs u ON a.utilisateur_id = u.id
       WHERE a.utilisateur_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.status(200).json(aides);
  } catch (err) {
    console.error('Erreur histoaides:', err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des dons' });
  }
};

// 🔹 Supprimer un don par ID
exports.supprimerAide = async (req, res) => {
  try {
    const aideId = parseInt(req.params.id, 10);
    if (isNaN(aideId)) return res.status(400).json({ message: 'ID invalide' });

    // Supprimer l'image si elle existe
    const [rows] = await db.execute('SELECT image FROM objetsaides WHERE id = ?', [aideId]);
    if (rows.length && rows[0].image) {
      const imagePath = path.join(__dirname, '../uploads', rows[0].image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await db.execute('DELETE FROM objetsaides WHERE id = ?', [aideId]);
    res.status(200).json({ message: 'Don retiré avec succès' });
  } catch (err) {
    console.error('Erreur suppression aide:', err);
    res.status(500).json({ message: 'Erreur lors du retrait du don' });
  }
};
