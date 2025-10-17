const express = require('express');
const router = express.Router();
const controller = require('../controllers/pubventes.controller');

router.get('/', controller.getVentes);
router.get('/categories', controller.getCategories);
router.post('/', controller.addObjetVente);
router.delete('/:id', controller.deleteObjetVente);

module.exports = router;
