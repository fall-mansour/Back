const db = require('../db');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../emailService'); // Service mail

const creerCompte = async (req, res) => {
  const { nom, mail, password, telephone, adresse, statut } = req.body;

  try {
    // Vérification de l'existence de l'utilisateur
    const [existingUsers] = await db.query('SELECT * FROM utilisateurs WHERE mail = ?', [mail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du compte
    await db.query(
      `INSERT INTO utilisateurs (nom, mail, password, telephone, adresse, statut, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [nom, mail, hashedPassword, telephone, adresse, statut]
    );

    // ✅ Envoi de l'email de bienvenue
    try {
      await sendWelcomeEmail(nom, mail);
    } catch (emailError) {
      console.error('Erreur lors de l’envoi du mail de bienvenue:', emailError);
    }

    // Réponse au frontend
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Un email de bienvenue a été envoyé.',
      data: { nom, mail }
    });

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du compte',
      details: error.message
    });
  }
};

module.exports = { creerCompte };
