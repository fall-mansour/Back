const express = require('express');
const router = express.Router();
const infosController = require('../controllers/infos.controller');

// Récupérer infos
router.get('/:mail', infosController.getInfos);

// Mettre à jour infos
router.put('/:mail', infosController.updateInfos);

module.exports = router;
