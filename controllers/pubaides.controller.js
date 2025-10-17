const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../cloudinary');

// Multer : stockage temporaire
const upload = multer({ dest: 'tmp/' }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
]);

// ➕ Ajouter un objet d’aide
exports.addObjetAide = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Erreur multer :', err);
      return res.status(500).json({ message: 'Erreur lors de l’upload des images' });
    }

    try {
      const { description, quantite, categorie, utilisateur_id } = req.body;

      if (!description || !quantite || !categorie || !utilisateur_id || !req.files['image']) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis (image principale incluse)' });
      }

      const uploadToCloudinary = async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'secondlife_uploads' });
        fs.unlinkSync(file.path);
        return result.secure_url;
      };

      const image = await uploadToCloudinary(req.files['image'][0]);
      const image1 = req.files['image1'] ? await uploadToCloudinary(req.files['image1'][0]) : null;
      const image2 = req.files['image2'] ? await uploadToCloudinary(req.files['image2'][0]) : null;

      const sql = `
        INSERT INTO objetsaides
        (description, quantite, categorie, utilisateur_id, image, image1, image2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(sql, [
        description, quantite, categorie, utilisateur_id, image, image1, image2
      ]);

      console.log('✅ Objet ajouté avec ID :', result.insertId);
      res.status(201).json({ message: 'Objet d’aide ajouté avec succès', id: result.insertId, image });

    } catch (error) {
      console.error('❌ Erreur Cloudinary / addObjetAide :', error);
      res.status(500).json({ message: 'Erreur serveur lors de l’ajout' });
    }
  });
};

// 🟩 Récupérer tous les objets d’aide
exports.getAides = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM objetsaides ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur getAides :', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des aides' });
  }
};

// 🟩 Récupérer les catégories
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT categorie FROM objetsaides');
    res.json(rows);
  } catch (error) {
    console.error('Erreur getCategories :', error);
    res.status(500).json({ message: 'Erreur lors du chargement des catégories' });
  }
};

// 🟥 Supprimer un objet d’aide
exports.deleteObjetAide = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM objetsaides WHERE id = ?', [id]);
    res.json({ message: 'Objet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteObjetAide :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};
