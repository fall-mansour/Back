const db = require('../db');

// Ajouter un objet d'aide
exports.ajouterObjetAide = async (req, res) => {
  try {
    const { description, quantite, utilisateur_id, categorie } = req.body;
    const image = req.file ? req.file.filename : null;

    // Vérification des champs requis
    if (!description || !quantite || !utilisateur_id || !image || !categorie) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Validation de la quantité
    const qte = Number(quantite);
    if (isNaN(qte) || qte <= 0) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }

    // Insertion dans la base
    const sql = `
      INSERT INTO objetsaides (description, quantite, image, utilisateur_id, categorie, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    await db.query(sql, [description.trim(), qte, image, utilisateur_id, categorie.trim()]);

    res.status(201).json({ message: '✅ Objet d’aide ajouté avec succès' });

  } catch (error) {
    console.error('❌ Erreur lors de l’ajout d’un objet aide :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l’ajout' });
  }
};

// Récupérer tous les objets d'aide
exports.getObjetsAides = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT oa.*, u.nom AS utilisateur_nom, u.telephone AS utilisateur_telephone
      FROM objetsaides oa
      JOIN utilisateurs u ON oa.utilisateur_id = u.id
      ORDER BY oa.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erreur récupération objets aides :', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des objets d’aide' });
  }
};
