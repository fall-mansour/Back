const db = require('../db'); // connexion MySQL
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../cloudinary'); // fichier cloudinary.js à la racine du backend

// Multer : stockage temporaire
const upload = multer({ dest: 'tmp/' }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// ➕ Ajouter un objet à vendre
exports.addObjetVente = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Erreur multer :', err);
      return res.status(500).json({ message: 'Erreur lors de l’upload des images' });
    }

    try {
      const { description, quantite, prix, categorie, utilisateur_id } = req.body;

      if (!description || !quantite || !prix || !categorie || !utilisateur_id || !req.files['image']) {
        return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis (image principale incluse)' });
      }

      // Fonction pour uploader sur Cloudinary et supprimer le fichier temporaire
      const uploadToCloudinary = async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'secondlife_uploads' });
        fs.unlinkSync(file.path);
        return result.secure_url;
      };

      // Upload des images
      const image = await uploadToCloudinary(req.files['image'][0]);
      const image1 = req.files['image1'] ? await uploadToCloudinary(req.files['image1'][0]) : null;
      const image2 = req.files['image2'] ? await uploadToCloudinary(req.files['image2'][0]) : null;

      // Insertion en base
      const sql = `
        INSERT INTO objetsventes
        (description, quantite, prix, categorie, utilisateur_id, image, image1, image2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(sql, [
        description, quantite, prix, categorie, utilisateur_id, image, image1, image2
      ]);

      res.status(201).json({ message: 'Objet ajouté avec succès', id: result.insertId, image });

    } catch (error) {
      console.error('Erreur Cloudinary / addObjetVente :', error);
      res.status(500).json({ message: 'Erreur serveur lors de l’ajout de l’objet' });
    }
  });
};

// 🔹 Récupérer tous les objets en vente
exports.getVentes = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM objetsventes');
    res.json(rows);
  } catch (error) {
    console.error('Erreur getVentes :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 Récupérer toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT categorie FROM objetsventes');
    res.json(rows);
  } catch (error) {
    console.error('Erreur getCategories :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 Supprimer un objet à vendre
exports.deleteObjetVente = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM objetsventes WHERE id = ?', [id]);
    res.json({ message: 'Objet supprimé' });
  } catch (error) {
    console.error('Erreur deleteObjetVente :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
