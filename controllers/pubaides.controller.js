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

// Fonction pour uploader un buffer sur Cloudinary
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

      const image = await uploadToCloudinary(req.files['image'][0].buffer);
      const image1 = req.files['image1'] ? await uploadToCloudinary(req.files['image1'][0].buffer) : null;
      const image2 = req.files['image2'] ? await uploadToCloudinary(req.files['image2'][0].buffer) : null;

      const sql = `
        INSERT INTO objetsaides
        (description, quantite, categorie, utilisateur_id, image, image1, image2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.execute(sql, [
        description, quantite, categorie, utilisateur_id, image, image1, image2
      ]);

      res.status(201).json({ message: 'Objet d’aide ajouté avec succès', id: result.insertId, image });

    } catch (error) {
      console.error('Erreur Cloudinary / addObjetAide :', error);
      res.status(500).json({ message: 'Erreur serveur lors de l’ajout' });
    }
  });
};
