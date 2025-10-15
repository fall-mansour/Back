// backend/emailPaiement.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur (identique à emailService.js)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASSWORD
    }
});

/**
 * Notifie le vendeur d'une vente
 * @param {string} sellerEmail - Email du vendeur
 * @param {object} buyerInfo - Infos acheteur {nom, telephone}
 * @param {array} products - Liste des produits vendus [{id, nom, prix, quantité}]
 * @param {number} total - Montant total
 * @param {string} paymentMethod - Opérateur de paiement
 */
async function notifySeller(sellerEmail, buyerInfo, products, total, paymentMethod) {
    try {
        // Formatage de la liste des produits
        const productsList = products.map(p =>
            `<tr>
                <td>${p.nom}</td>
                <td>${p.prix}€</td>
                <td>${p.quantite || 1}</td>
            </tr>`
        ).join('');

        const mailOptions = {
            from: '"Votre Plateforme" <no-reply@votredomaine.com>',
            to: sellerEmail,
            subject: 'Nouvelle vente confirmée !',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #2563eb;">Bonjour,</h2>
                    <p>Vous avez une nouvelle vente :</p>

                    <h3>Informations acheteur :</h3>
                    <ul>
                        <li>Nom: ${buyerInfo.nom}</li>
                        <li>Téléphone: ${buyerInfo.telephone}</li>
                    </ul>

                    <h3>Détails de la commande :</h3>
                    <table border="1" cellpadding="5" cellspacing="0" width="100%">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Prix</th>
                                <th>Quantité</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsList}
                        </tbody>
                    </table>

                    <p><strong>Total :</strong> ${total}€</p>
                    <p><strong>Méthode de paiement :</strong> ${paymentMethod}</p>

                    <p style="margin-top: 20px;">Connectez-vous à votre espace vendeur pour plus de détails.</p>
                </div>
            `,
            text: `Nouvelle vente de ${total}€ via ${paymentMethod}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Notification envoyée au vendeur: ${sellerEmail}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi au vendeur:", error);
        throw error;
    }
}

module.exports = { notifySeller };
