// routes/objetsaides.js
const express = require('express');
const router = express.Router();
const { addObjetAide } = require('../controllers/objets.controller');

// Multer en mémoire pour upload vers Cloudinary
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]);

// Route POST pour ajouter un objet d’aide
// upload est la fonction middleware de multer
router.post('/ajout', upload, addObjetAide);

module.exports = router;
