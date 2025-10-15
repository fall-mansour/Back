const express = require('express');
const router = express.Router();
const multer = require('multer');

const { ajouterObjetAide } = require('../controllers/objets.controller');

// Config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Route POST
router.post('/ajouter', upload.single('image'), ajouterObjetAide);

module.exports = router;
