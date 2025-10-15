// routes/histoaides.js
const express = require('express');
const router = express.Router();
const histoaidesController = require('../controllers/histoaides.controller');

router.get('/', histoaidesController.getHistoaides);
router.delete('/:id', histoaidesController.supprimerAide);

module.exports = router;
