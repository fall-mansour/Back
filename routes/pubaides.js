const express = require('express');
const router = express.Router();
const pubaidesCtrl = require('../controllers/pubaides.controller');

router.get('/', pubaidesCtrl.getAides);
router.get('/categories', pubaidesCtrl.getCategories);

// 🔑 POST pour ajouter un objet avec les 3 images
router.post('/', pubaidesCtrl.uploadImages, pubaidesCtrl.addObjetAide);

router.delete('/:id', pubaidesCtrl.deleteObjetAide);

module.exports = router;
