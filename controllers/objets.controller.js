const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('../cloudinary'); // fichier cloudinary.js à la racine du backend

// Multer : stockage temporaire
const upload = multer({ dest: 'tmp/' }).single('image');

// ➕ Ajouter un objet d'aide
exports.ajouterObjetAide = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Erreur multer :', err);
      return res.status(500).json({ message: 'Erreur lors de l’upload de l’image' });
    }

    try {
      const { description, quantite, utilisateur_id, categorie } = req.body;

      if (!description || !quantite || !utilisateur_id || !req.file || !categorie) {
        return res.status(400).json({ message: 'Tous les champs sont requis (image incluse)' });
      }

      // 🔹 Upload sur Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'secondlife_uploads' });
      fs.unlinkSync(req.file.path); // supprimer le fichier temporaire
      const imageUrl = result.secure_url;

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
      await db.query(sql, [description.trim(), qte, imageUrl, utilisateur_id, categorie.trim()]);

      res.status(201).json({ message: '✅ Objet d’aide ajouté avec succès', imageUrl });

    } catch (error) {
      console.error('❌ Erreur lors de l’ajout d’un objet aide :', error);
      res.status(500).json({ message: 'Erreur serveur lors de l’ajout' });
    }
  });
};

// 🔹 Récupérer tous les objets d'aide (pas besoin de changer)
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
