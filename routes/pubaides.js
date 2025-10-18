const express = require('express');
const router = express.Router();
const controller = require('../controllers/pubaides.controller');

// === Routes pour les objets d’aide ===

// POST : ajouter un objet d’aide
router.post('/ajout-aide', controller.addObjetAide);

// GET : afficher tous les objets d’aide
router.get('/liste', controller.afficherObjetsAides);

module.exports = router;
