const db = require('../db');
const multer = require('multer');
const cloudinary = require('../cloudinary');

// Multer en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// Fonction pour uploader sur Cloudinary à partir d'un buffer
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'secondlife_uploads' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

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

      // Upload des images sur Cloudinary
      const image = await uploadToCloudinary(req.files['image'][0].buffer);
      const image1 = req.files['image1'] ? await uploadToCloudinary(req.files['image1'][0].buffer) : null;
      const image2 = req.files['image2'] ? await uploadToCloudinary(req.files['image2'][0].buffer) : null;

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
