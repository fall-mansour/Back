// === controllers/pubaides.controller.js ===
const db = require('../db');
const multer = require('multer');
const path = require('path');

// === Configuration de Multer pour l’upload d’images ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middleware pour gérer jusqu’à 3 images
exports.uploadImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
]);

// === Ajouter un objet d’aide ===
exports.addObjetAide = async (req, res) => {
  try {
    const { description, quantite, categorie, utilisateur_id } = req.body;

    const image = req.files?.image?.[0]?.filename || null;
    const image1 = req.files?.image1?.[0]?.filename || null;
    const image2 = req.files?.image2?.[0]?.filename || null;

    const sql = `
      INSERT INTO objetsaides
      (description, quantite, categorie, utilisateur_id, image, image1, image2)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      description, quantite, categorie, utilisateur_id, image, image1, image2
    ]);

    console.log('✅ Objet ajouté avec ID :', result.insertId);
    res.status(201).json({ message: 'Objet d’aide ajouté avec succès', id: result.insertId });

  } catch (err) {
    console.error('❌ Erreur addObjetAide :', err);
    res.status(500).json({ message: 'Erreur serveur lors de l’ajout' });
  }
};

// === Récupérer toutes les aides ===
exports.getAides = async (req, res) => {
  try {
    const { categorie } = req.query;
    console.log('📥 [pubaides] Requête getAides - catégorie :', categorie);

    let sql = `
      SELECT a.id, a.description, a.quantite, a.categorie,
             a.image, a.image1, a.image2, a.created_at,
             u.nom AS utilisateur_nom, u.telephone AS utilisateur_telephone, u.adresse AS utilisateur_adresse
      FROM objetsaides a
      LEFT JOIN utilisateurs u ON a.utilisateur_id = u.id
    `;
    const params = [];

    // Filtrage par catégorie
    if (categorie && categorie.toLowerCase() !== 'toutes') {
      sql += ' WHERE a.categorie = ?';
      params.push(categorie);
    }

    sql += ' ORDER BY a.id DESC';
    console.log('🔍 SQL exécutée :', sql, 'Params :', params);

    const [rows] = await db.execute(sql, params);

    console.log(`📦 ${rows.length} aides récupérées`);
    res.json(rows);

  } catch (err) {
    console.error('❌ [pubaides] Erreur getAides :', err);
    res.status(500).json({ message: 'Erreur lors du chargement des aides' });
  }
};

// === Récupérer toutes les catégories ===
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT DISTINCT categorie FROM objetsaides ORDER BY categorie`);
    const categories = rows.map(r => r.categorie);
    res.json(categories);
  } catch (err) {
    console.error('❌ Erreur getCategories :', err);
    res.status(500).json({ message: 'Erreur chargement catégories' });
  }
};

// === Supprimer un objet d’aide ===
exports.deleteObjetAide = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute('DELETE FROM objetsaides WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objet non trouvé' });
    }

    console.log(`🗑️ Objet supprimé ID: ${id}`);
    res.status(200).json({ message: 'Objet supprimé avec succès' });

  } catch (err) {
    console.error('❌ Erreur deleteObjetAide :', err);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
};
