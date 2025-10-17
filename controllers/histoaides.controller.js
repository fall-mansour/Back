const db = require('../db'); // connexion MySQL
const cloudinary = require('../cloudinary'); // fichier cloudinary.js à la racine du backend

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

// 🔹 Supprimer un don par ID (Cloudinary)
exports.supprimerAide = async (req, res) => {
  try {
    const aideId = parseInt(req.params.id, 10);
    if (isNaN(aideId)) return res.status(400).json({ message: 'ID invalide' });

    // Récupérer l'URL Cloudinary de l'image
    const [rows] = await db.execute('SELECT image FROM objetsaides WHERE id = ?', [aideId]);
    if (rows.length && rows[0].image) {
      const imageUrl = rows[0].image;

      // Extraire le public_id à partir de l'URL Cloudinary
      const publicIdMatch = imageUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
      if (publicIdMatch) {
        const publicId = 'secondlife_uploads/' + publicIdMatch[1];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Erreur suppression image Cloudinary:', err);
        }
      }
    }

    // Supprimer l'objet de la base
    await db.execute('DELETE FROM objetsaides WHERE id = ?', [aideId]);
    res.status(200).json({ message: 'Don retiré avec succès' });
  } catch (err) {
    console.error('Erreur suppression aide:', err);
    res.status(500).json({ message: 'Erreur lors du retrait du don' });
  }
};
