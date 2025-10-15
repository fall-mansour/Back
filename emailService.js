const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jaay.jappalante@gmail.com',     // ton Gmail
    pass: 'bsih bcbj ykhn njrg'            // mot de passe d’application
  }
});

/**
 * Envoi du mail de bienvenue après création de compte
 * @param {string} nom - Nom de l'utilisateur
 * @param {string} mail - Email de l'utilisateur
 */
async function sendWelcomeEmail(nom, mail) {
  const mailOptions = {
    from: `"Jaay & Jappalante" <jaay.jappalante@gmail.com>`,
    to: mail,
    subject: 'Bienvenue sur Jaay&Jappalante ! 🎉',
    html: `
      <h2>Bonjour ${nom},</h2>
      <p>Bienvenue sur <strong>Jaay&Jappalante</strong> !</p>
      <p>Votre compte a été créé avec succès. Vous pouvez vous connecter avec l'adresse email suivante :</p>
      <p><strong>${mail}</strong></p>
      <p>Merci de nous rejoindre et profitez pleinement de nos services.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Envoi d'un mail de notification lors du changement de mot de passe
 * @param {string} nom - Nom de l'utilisateur
 * @param {string} mail - Email de l'utilisateur
 */
async function sendPasswordChangeEmail(nom, mail) {
  const mailOptions = {
    from: `"Jaay & Jappalante" <jaay.jappalante@gmail.com>`,
    to: mail,
    subject: 'Votre mot de passe a été modifié 🔒',
    html: `
      <h2>Bonjour ${nom},</h2>
      <p>Nous vous confirmons que votre mot de passe a été modifié avec succès.</p>
      <p>Si vous n’êtes pas à l’origine de ce changement, veuillez nous contacter immédiatement.</p>
      <p>Merci,</p>
      <p>L’équipe Jaay&Jappalante</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Export des fonctions
module.exports = { sendWelcomeEmail, sendPasswordChangeEmail };
