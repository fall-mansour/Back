const express = require('express');
const router = express.Router();
const histoventesController = require('../controllers/histoventes.controller');

// GET toutes les ventes d’un utilisateur
router.get('/utilisateur/:id', histoventesController.getVentesByUser);

// DELETE une vente par ID
router.delete('/:id', histoventesController.deleteObjetVente);

module.exports = router;
