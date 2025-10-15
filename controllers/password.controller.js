const db = require('../db'); // connexion MySQL
const bcrypt = require('bcrypt');
const { sendPasswordChangeEmail } = require('../emailService'); // Service mail

exports.resetPassword = async (req, res) => {
  try {
    const { mail, password, confirmPassword } = req.body;

    // Vérification des champs
    if (!mail || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Merci de fournir l’email, le mot de passe et la confirmation.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
    }

    // Vérifier si l'utilisateur existe
    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE mail = ?', [mail]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Hacher le mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe
    const [result] = await db.query('UPDATE utilisateurs SET password = ? WHERE mail = ?', [hash, mail]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ error: "Impossible de mettre à jour le mot de passe." });
    }

    // ✅ Envoi de l'email de notification
    try {
      await sendPasswordChangeEmail(rows[0].nom, mail);
    } catch (emailError) {
      console.error('Erreur lors de l’envoi du mail de notification:', emailError);
    }

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès. Un email de confirmation a été envoyé." });

  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ error: "Erreur serveur lors de la réinitialisation." });
  }
};
