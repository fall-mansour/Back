// routes/pubaides.js
const express = require('express');
const router = express.Router();
const pubaidesCtrl = require('../controllers/pubaides.controller');

// 🔹 Récupérer toutes les aides (optionnel : filtrage par catégorie)
router.get('/', pubaidesCtrl.getAides);

// 🔹 Récupérer toutes les catégories
router.get('/categories', pubaidesCtrl.getCategories);

// 🔹 Ajouter un objet d’aide avec upload Cloudinary
router.post('/', pubaidesCtrl.addObjetAide);

// 🔹 Supprimer un objet d’aide par ID
router.delete('/:id', pubaidesCtrl.deleteObjetAide);

module.exports = router;
