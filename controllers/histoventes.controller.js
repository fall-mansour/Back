const db = require('../db');
const cloudinary = require('../cloudinary'); // fichier cloudinary.js à la racine

// Récupérer les ventes d’un utilisateur
exports.getVentesByUser = async (req, res) => {
  const utilisateurId = req.params.id;

  try {
    const [ventes] = await db.execute(
      `SELECT v.id, v.description, v.quantite, v.prix, v.image, v.image1, v.image2, v.created_at,
              u.nom AS nom, u.telephone AS telephone, u.adresse AS adresse
       FROM objetsventes v
       JOIN utilisateurs u ON v.utilisateur_id = u.id
       WHERE v.utilisateur_id = ?
       ORDER BY v.created_at DESC`,
      [utilisateurId]
    );

    res.status(200).json(ventes);
  } catch (err) {
    console.error('Erreur getVentesByUser:', err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des ventes' });
  }
};

// Supprimer un objet vente (Cloudinary)
exports.deleteObjetVente = async (req, res) => {
  const { id } = req.params;

  try {
    // Récupérer les URLs Cloudinary des images
    const [rows] = await db.execute('SELECT image, image1, image2 FROM objetsventes WHERE id = ?', [id]);
    if (rows.length) {
      const images = [rows[0].image, rows[0].image1, rows[0].image2].filter(Boolean);

      for (const imgUrl of images) {
        // Extraire le public_id à partir de l'URL
        const match = imgUrl.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|svg)$/);
        if (match) {
          const publicId = 'secondlife_uploads/' + match[1];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Erreur suppression image Cloudinary:', err);
          }
        }
      }
    }

    // Supprimer l’objet en base
    const [result] = await db.execute('DELETE FROM objetsventes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objet vente non trouvé' });
    }

    res.status(200).json({ message: 'Objet vente supprimé avec succès' });
  } catch (err) {
    console.error('Erreur deleteObjetVente:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};
