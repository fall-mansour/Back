const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventes.controller');

// Route POST pour ajout de vente avec plusieurs images
router.post('/ajout-vente', controller.ajoutVente);

module.exports = router;
