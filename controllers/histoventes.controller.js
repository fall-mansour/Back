const db = require('../db'); // connexion MySQL

// Récupérer les ventes d’un utilisateur
exports.getVentesByUser = async (req, res) => {
  const utilisateurId = req.params.id;

  try {
    const [ventes] = await db.execute(
      `SELECT v.id, v.description, v.quantite, v.prix, v.image, v.created_at,
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

// Supprimer un objet vente
exports.deleteObjetVente = async (req, res) => {
  const { id } = req.params;

  try {
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
