const express = require('express');
const router = express.Router();
const controller = require('../controllers/pubventes.controller');

// Récupérer tous les objets en vente
router.get('/', controller.getVentes);

// Récupérer toutes les catégories
router.get('/categories', controller.getCategories);

module.exports = router;
