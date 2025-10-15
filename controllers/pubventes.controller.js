const db = require('../db'); // connexion MySQL

/**
 * Récupérer les objets à vendre
 * - Si categorie = "toute" ou non définie → renvoie tous les objets
 * - Sinon filtre par categorie
 */
exports.getVentes = async (req, res) => {
  try {
    const { categorie } = req.query;
    console.log('[pubventes] Requête getVentes - catégorie:', categorie);

    let sql = `
      SELECT v.id, v.description, v.quantite, v.prix,
             v.image, v.image1, v.image2, v.created_at,
             u.nom AS vendeurNom, u.telephone AS vendeurNumero, u.adresse, v.categorie
      FROM objetsventes v
      JOIN utilisateurs u ON v.utilisateur_id = u.id
    `;
    const params = [];

    if (categorie && categorie.toLowerCase() !== 'toute') {
      sql += ' WHERE v.categorie = ?';
      params.push(categorie);
    }

    sql += ' ORDER BY v.created_at DESC';

    console.log('[pubventes] SQL:', sql, 'Params:', params);

    const [ventes] = await db.execute(sql, params);

    console.log('[pubventes] Ventes récupérées:', ventes.length);

    res.json(ventes);
  } catch (err) {
    console.error('[pubventes] Erreur getVentes:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des ventes' });
  }
};


/**
 * Récupérer toutes les catégories uniques
 */
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(
      `SELECT DISTINCT categorie FROM objetsventes ORDER BY categorie`
    );
    res.json(categories.map(c => c.categorie));
  } catch (err) {
    console.error('Erreur getCategories:', err);
    res.status(500).json({ message: 'Erreur lors du chargement des catégories' });
  }
};

/**
 * Supprimer un objet à vendre par son ID
 */
exports.deleteObjetVente = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      'DELETE FROM objetsventes WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objet vente non trouvé' });
    }

    res.status(200).json({ message: 'Objet vente supprimé avec succès' });
  } catch (err) {
    console.error('Erreur deleteObjetVente:', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};

/**
 * Ajouter un objet à vendre (optionnel)
 * Si tu veux gérer l'ajout avec image1 et image2
 */
exports.addObjetVente = async (req, res) => {
  try {
    const { description, quantite, prix, categorie, utilisateur_id } = req.body;
    const image = req.files?.image?.[0]?.filename || null;
    const image1 = req.files?.image1?.[0]?.filename || null;
    const image2 = req.files?.image2?.[0]?.filename || null;

    const sql = `
      INSERT INTO objetsventes (description, quantite, prix, categorie, utilisateur_id, image, image1, image2)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      description,
      quantite,
      prix,
      categorie,
      utilisateur_id,
      image,
      image1,
      image2
    ]);

    res.status(201).json({ message: 'Objet ajouté avec succès', id: result.insertId });
  } catch (err) {
    console.error('Erreur addObjetVente:', err);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout de l\'objet' });
  }


};
