// infos.controller.js
const db = require('../db'); // ton pool MySQL déjà configuré

// 🔹 Récupérer les infos utilisateur avec temps restant sur changement de statut
exports.getInfos = async (req, res) => {
  try {
    const mail = decodeURIComponent(req.params.mail);

    const [rows] = await db.query(
      'SELECT nom, mail, telephone, adresse, statut, created_at, dernier_modif_statut FROM utilisateurs WHERE mail = ?',
      [mail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const utilisateur = rows[0];
    const maintenant = new Date();
    const DELAI_MS = 15 * 24 * 60 * 60 * 1000; // 15 jours en ms
    let tempsRestant = 0;

    if (utilisateur.dernier_modif_statut) {
      const dernierChangement = new Date(utilisateur.dernier_modif_statut);
      const diff = maintenant - dernierChangement;
      if (diff < DELAI_MS) {
        tempsRestant = Math.ceil((DELAI_MS - diff) / 1000); // secondes
      }
    }

    res.json({ ...utilisateur, tempsRestant });

  } catch (err) {
    console.error('Erreur getInfos:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// 🔹 Mettre à jour les infos utilisateur avec règles du statut
exports.updateInfos = async (req, res) => {
  try {
    const mail = decodeURIComponent(req.params.mail);
    const { nom, password, telephone, adresse, statut } = req.body;

    if (!nom || !telephone || !adresse || !statut) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const [rows] = await db.query(
      'SELECT statut, password AS currentPassword, created_at, dernier_modif_statut FROM utilisateurs WHERE mail = ?',
      [mail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const ancienStatut = rows[0].statut;
    const dernierChangement = rows[0].dernier_modif_statut ? new Date(rows[0].dernier_modif_statut) : null;
    const maintenant = new Date();
    const DELAI_MS = 15 * 24 * 60 * 60 * 1000; // 15 jours

    // Calcul temps restant si statut est bloqué
    if (statut !== ancienStatut && dernierChangement) {
      const diff = maintenant - dernierChangement;
      if (diff < DELAI_MS) {
        const tempsRestant = Math.ceil((DELAI_MS - diff) / 1000); // en secondes
        return res.status(403).json({
          message: `Vous pouvez modifier le statut dans ${Math.ceil(tempsRestant / (60*60*24))} jours.`,
          tempsRestant
        });
      }
    }

    // Mise à jour des champs
    if (statut !== ancienStatut) {
      await db.query(
        `UPDATE utilisateurs
         SET nom = ?, password = ?, telephone = ?, adresse = ?, statut = ?, dernier_modif_statut = NOW()
         WHERE mail = ?`,
        [nom, password || rows[0].currentPassword, telephone, adresse, statut, mail]
      );
    } else {
      await db.query(
        `UPDATE utilisateurs
         SET nom = ?, password = ?, telephone = ?, adresse = ?
         WHERE mail = ?`,
        [nom, password || rows[0].currentPassword, telephone, adresse, mail]
      );
    }

    // Calcul temps restant après mise à jour
    let tempsRestant = 0;
    if (statut === ancienStatut && dernierChangement) {
      const diff = maintenant - dernierChangement;
      if (diff < DELAI_MS) {
        tempsRestant = Math.ceil((DELAI_MS - diff) / 1000);
      }
    }

    res.json({ message: 'Informations mises à jour avec succès', tempsRestant });

  } catch (err) {
    console.error('Erreur updateInfos:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
