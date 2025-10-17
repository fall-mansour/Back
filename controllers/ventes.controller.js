const db = require('../db'); // ta config MySQL
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../cloudinary'); // import du fichier Cloudinary à la racine du backend

// 🔹 Multer : stockage temporaire en mémoire
const upload = multer({ dest: 'tmp/' }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// ➕ Ajouter une vente
exports.ajoutVente = (req, res) => {
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

      // 🔹 Fonction pour uploader sur Cloudinary et supprimer le fichier temporaire
      const uploadToCloudinary = async (file) => {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'secondlife_uploads' });
        fs.unlinkSync(file.path); // supprimer le fichier temporaire
        return result.secure_url;
      };

      // 🔹 Upload des images
      const image = await uploadToCloudinary(req.files['image'][0]);
      const image1 = req.files['image1'] ? await uploadToCloudinary(req.files['image1'][0]) : null;
      const image2 = req.files['image2'] ? await uploadToCloudinary(req.files['image2'][0]) : null;

      // 🔹 Insertion en base
      const sql = `INSERT INTO objetsventes
        (description, quantite, prix, categorie, utilisateur_id, image, image1, image2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(sql, [description, quantite, prix, categorie, utilisateur_id, image, image1, image2], (err, result) => {
        if (err) {
          console.error('Erreur MySQL :', err);
          return res.status(500).json({ message: 'Erreur lors de l’insertion en base de données' });
        }
        return res.json({ message: 'Vente ajoutée avec succès', id: result.insertId });
      });

    } catch (error) {
      console.error('Erreur Cloudinary :', error);
      return res.status(500).json({ message: 'Erreur lors de l’upload sur Cloudinary' });
    }
  });
};
