// backend/mailer.js
const nodemailer = require('nodemailer');

// Configuration SMTP Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true si port 465
  auth: {
    user: '980d53001@smtp-brevo.com',
    pass: 'J6cVPryQYGBZRhU0'
  }
});

// Fonction générique pour envoyer un mail
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"SecondLife" <980d53001@smtp-brevo.com>`, // expéditeur
      to,      // destinataire
      subject, // objet
      text,    // texte brut
      html     // texte HTML
    });

    console.log('✅ Email envoyé :', info.messageId);
  } catch (error) {
    console.error('❌ Erreur envoi email :', error);
  }
}

// Fonction spécifique : mail de bienvenue lors de la création de compte
async function sendWelcomeEmail(userEmail, userName) {
  const subject = 'Bienvenue sur SecondLife ! 🎉';
  const text = `Bonjour ${userName},\n\nBienvenue sur SecondLife !\nVotre compte a été créé avec l'email : ${userEmail}.\n\nMerci de nous rejoindre !`;
  const html = `<p>Bonjour <b>${userName}</b>,</p>
                <p>Bienvenue sur <b>SecondLife</b> !</p>
                <p>Votre compte a été créé avec l'email : <b>${userEmail}</b>.</p>
                <p>Merci de nous rejoindre !</p>`;

  await sendMail(userEmail, subject, text, html);
}

// Fonction spécifique : mail lors de la modification de mot de passe
async function sendPasswordChangeEmail(userEmail, userName) {
  const subject = 'Modification de votre mot de passe 🔒';
  const text = `Bonjour ${userName},\n\nVotre mot de passe a été modifié avec succès.\nSi vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement.`;
  const html = `<p>Bonjour <b>${userName}</b>,</p>
                <p>Votre mot de passe a été modifié avec succès.</p>
                <p>Si vous n'êtes pas à l'origine de ce changement, contactez notre support immédiatement.</p>`;

  await sendMail(userEmail, subject, text, html);
}

// Export des fonctions pour les utiliser ailleurs
module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendPasswordChangeEmail
};
