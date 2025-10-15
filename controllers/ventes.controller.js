const db = require('../db'); // ta config MySQL
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// 📂 Dossier de stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 👌 Multer pour gérer plusieurs fichiers
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// ➕ Ajouter une vente
exports.ajoutVente = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Erreur multer :', err);
      return res.status(500).json({ message: 'Erreur lors de l’upload des images' });
    }

    const { description, quantite, prix, categorie, utilisateur_id } = req.body;

    if (!description || !quantite || !prix || !categorie || !utilisateur_id || !req.files['image']) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis (image principale incluse)' });
    }

    const image = req.files['image'][0].filename;
    const image1 = req.files['image1'] ? req.files['image1'][0].filename : null;
    const image2 = req.files['image2'] ? req.files['image2'][0].filename : null;

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
  });
};
