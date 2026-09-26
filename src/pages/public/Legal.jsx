// Pages légales — rédigées à partir des pratiques réelles de la plateforme
// (données collectées, sous-traitants tiers effectivement intégrés : Kkiapay,
// Google Gemini, Brevo). Base de départ raisonnable, pas un avis juridique :
// une relecture par un juriste est recommandée avant usage commercial réel,
// notamment pour la conformité APDP (loi béninoise n°2017-20).

import { SITE } from '../../config/site'

const misAJour = '26 septembre 2026'

export function PolitiqueConfidentialite() {
  return (
    <div className="page-legal">
      <div className="page-hero page-hero--sm">
        <h1>Politique de confidentialité</h1>
        <p>Dernière mise à jour : {misAJour}</p>
      </div>

      <div className="container legal-content">
        <section>
          <h2>1. Qui sommes-nous ?</h2>
          <p>
            {SITE.nomPlateforme} (Bénin Tourisme) est une plateforme éditée par {SITE.nomEntreprise},
            basée à {SITE.contactAdresse}. Pour toute question relative à vos données personnelles,
            vous pouvez nous contacter à <strong>{SITE.contactEmail}</strong> ou au{' '}
            <strong>{SITE.contactTel}</strong>.
          </p>
        </section>

        <section>
          <h2>2. Données que nous collectons</h2>
          <p>Selon votre type de compte, nous collectons :</p>
          <ul>
            <li><strong>Touriste :</strong> nom, prénom, email, téléphone, nationalité, mot de passe (stocké de façon chiffrée, jamais en clair).</li>
            <li><strong>Prestataire :</strong> nom de l'entreprise, type d'activité, email, téléphone, mot de passe, ainsi que le contenu des fiches que vous publiez (hôtel, restaurant, transport, site, événement).</li>
            <li><strong>Utilisation du service :</strong> réservations, billets achetés, avis et notes laissés, favoris enregistrés, circuits générés ou créés manuellement.</li>
            <li><strong>Géolocalisation :</strong> si vous l'autorisez dans votre navigateur, votre position est utilisée pour la recherche « à proximité » — elle n'est pas enregistrée côté serveur, seulement utilisée le temps de la recherche.</li>
            <li><strong>Assistant IA / génération de circuit :</strong> les messages que vous saisissez dans le chat et vos critères (budget, période, préférences) sont transmis au moteur d'IA pour générer une réponse ou un circuit. Évitez d'y saisir des informations sensibles inutiles à votre demande.</li>
          </ul>
        </section>

        <section>
          <h2>3. Comment nous utilisons vos données</h2>
          <ul>
            <li>Créer et sécuriser votre compte, vous authentifier.</li>
            <li>Traiter vos réservations, commandes et paiements.</li>
            <li>Vous envoyer des notifications liées à votre activité (confirmation de réservation, changement de statut d'une fiche, réinitialisation de mot de passe).</li>
            <li>Permettre au responsable régional compétent de valider les fiches soumises par les prestataires.</li>
            <li>Générer des propositions de circuits personnalisés via l'IA.</li>
            <li>Améliorer la plateforme (statistiques d'usage agrégées, non individuelles).</li>
          </ul>
        </section>

        <section>
          <h2>4. Avec qui partageons-nous vos données ?</h2>
          <p>Nous ne vendons jamais vos données. Elles peuvent transiter par les prestataires techniques suivants, uniquement pour les besoins du service :</p>
          <ul>
            <li><strong>Kkiapay</strong> — traitement des paiements en ligne. Nous ne stockons aucune donnée bancaire ou de mobile money ; Kkiapay traite la transaction et nous transmet uniquement son statut.</li>
            <li><strong>Google Gemini (API IA)</strong> — génération des réponses de l'assistant conversationnel et des circuits personnalisés, à partir des critères que vous fournissez.</li>
            <li><strong>Brevo</strong> — envoi de nos emails transactionnels (confirmations, notifications, réinitialisation de mot de passe).</li>
          </ul>
          <p>Ces prestataires n'utilisent vos données que pour exécuter le service demandé, pas pour leur propre compte.</p>
        </section>

        <section>
          <h2>5. Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. Si vous demandez la suppression
            de votre compte, vos données personnelles sont supprimées ou anonymisées, sous réserve des
            obligations légales de conservation (ex. factures).
          </p>
        </section>

        <section>
          <h2>6. Vos droits</h2>
          <p>
            Conformément à la loi béninoise n°2017-20 du 20 avril 2018 relative au code du numérique
            (protection des données à caractère personnel), vous disposez d'un droit d'accès, de
            rectification, d'opposition et de suppression de vos données. Vous pouvez exercer ces droits
            en nous contactant à <strong>{SITE.contactEmail}</strong>. Vous pouvez aussi modifier vos
            informations directement depuis votre espace personnel, ou demander la suppression de votre compte.
          </p>
        </section>

        <section>
          <h2>7. Cookies et stockage local</h2>
          <p>
            Nous utilisons le stockage local de votre navigateur (localStorage) pour maintenir votre
            session connectée (jeton d'authentification). Aucun cookie publicitaire ou traceur tiers
            n'est utilisé sur la plateforme.
          </p>
        </section>

        <section>
          <h2>8. Sécurité</h2>
          <p>
            Les mots de passe sont stockés sous forme chiffrée (hachage). Les connexions au site utilisent
            HTTPS en production. L'accès aux données est cloisonné selon votre rôle (touriste, prestataire,
            responsable régional, administrateur).
          </p>
        </section>

        <section>
          <h2>9. Modifications</h2>
          <p>
            Cette politique peut évoluer avec la plateforme. Toute modification importante vous sera
            signalée via la plateforme ou par email.
          </p>
        </section>
      </div>
    </div>
  )
}

export function ConditionsUtilisation() {
  return (
    <div className="page-legal">
      <div className="page-hero page-hero--sm">
        <h1>Conditions d'utilisation</h1>
        <p>Dernière mise à jour : {misAJour}</p>
      </div>

      <div className="container legal-content">
        <section>
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions régissent l'utilisation de la plateforme {SITE.nomPlateforme} (Bénin Tourisme),
            éditée par {SITE.nomEntreprise}, qui met en relation touristes, prestataires touristiques
            (hôtels, restaurants, transporteurs, organisateurs d'événements, sites touristiques) et
            responsables régionaux chargés de la validation des offres.
          </p>
        </section>

        <section>
          <h2>2. Comptes utilisateurs</h2>
          <ul>
            <li><strong>Touriste :</strong> toute personne créant un compte pour consulter les offres, réserver, acheter des billets ou générer un circuit doit fournir des informations exactes.</li>
            <li><strong>Prestataire :</strong> l'inscription en tant que prestataire nécessite un compte professionnel. Les fiches publiées (hôtel, restaurant, transport, site, événement) doivent décrire fidèlement le service réellement proposé. Toute fiche est soumise à validation par le responsable régional de la zone concernée avant sa mise en ligne.</li>
            <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
          </ul>
        </section>

        <section>
          <h2>3. Réservations, billetterie et paiement</h2>
          <ul>
            <li>Toute réservation ou achat de billet est confirmé après validation du paiement.</li>
            <li>Les paiements sont traités par notre partenaire Kkiapay ; nous ne stockons aucune donnée bancaire.</li>
            <li>Un billet électronique (QR code) est délivré pour les événements payants et sert de justificatif d'accès.</li>
            <li>Les conditions d'annulation ou de remboursement peuvent varier selon le prestataire et le type de service ; elles sont précisées, quand elles existent, sur la fiche du service concerné.</li>
          </ul>
        </section>

        <section>
          <h2>4. Avis et contenus publiés par les utilisateurs</h2>
          <p>
            Les avis, notes et commentaires doivent être sincères, refléter une expérience réelle, et ne
            pas contenir de propos injurieux, diffamatoires ou trompeurs. Les administrateurs peuvent
            modérer, approuver ou rejeter tout avis ne respectant pas ces règles.
          </p>
        </section>

        <section>
          <h2>5. Assistant IA et circuits générés</h2>
          <p>
            Les circuits et réponses proposés par l'assistant IA sont générés automatiquement à partir des
            offres réellement disponibles sur la plateforme et des critères que vous indiquez. Ils sont
            fournis à titre indicatif : vérifiez toujours les disponibilités, tarifs et conditions
            directement sur la fiche du service avant de réserver.
          </p>
        </section>

        <section>
          <h2>6. Obligations du prestataire</h2>
          <ul>
            <li>Fournir des informations exactes et à jour sur ses services (tarifs, disponibilités, horaires, localisation).</li>
            <li>Répondre aux demandes de précisions du responsable régional dans un délai raisonnable.</li>
            <li>Respecter la réglementation applicable à son secteur d'activité (hôtellerie, restauration, transport, événementiel).</li>
          </ul>
        </section>

        <section>
          <h2>7. Rôle du responsable régional</h2>
          <p>
            Le responsable régional valide, rejette ou demande des précisions sur les fiches soumises par
            les prestataires de sa zone géographique, avant leur publication sur la plateforme. Cette
            validation porte sur la conformité des informations fournies ; elle n'engage pas la
            responsabilité de Totché quant à la qualité effective du service rendu par le prestataire.
          </p>
        </section>

        <section>
          <h2>8. Responsabilité</h2>
          <p>
            Totché agit en tant qu'intermédiaire technique entre touristes et prestataires. Nous mettons
            tout en œuvre pour assurer la fiabilité des informations publiées (via la validation régionale),
            mais nous ne pouvons être tenus responsables de la qualité effective du service rendu par un
            prestataire, ni d'un événement indépendant de notre volonté (panne, force majeure, indisponibilité
            temporaire du service).
          </p>
        </section>

        <section>
          <h2>9. Suspension et suppression de compte</h2>
          <p>
            Tout compte utilisé de manière frauduleuse, ou en violation manifeste des présentes conditions,
            peut être suspendu ou supprimé par un administrateur, après examen de la situation.
          </p>
        </section>

        <section>
          <h2>10. Modification des conditions</h2>
          <p>
            Ces conditions peuvent être mises à jour pour refléter l'évolution de la plateforme. La date de
            dernière mise à jour est indiquée en haut de cette page.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Pour toute question relative à ces conditions : <strong>{SITE.contactEmail}</strong> —{' '}
            <strong>{SITE.contactTel}</strong> — {SITE.contactAdresse}.
          </p>
        </section>
      </div>
    </div>
  )
}
