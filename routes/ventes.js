const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventes.controller');

// === Route POST : ajout d’un objet à vendre ===
router.post('/ajout-vente', controller.ajoutVente);

module.exports = router;
