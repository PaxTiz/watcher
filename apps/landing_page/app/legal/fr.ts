import type { LegalContent, LegalInfo } from "~/utils/legal";

export default (info: LegalInfo): LegalContent => ({
  privacy: {
    title: "Politique de confidentialité",
    description:
      "Les données que Watcher collecte, pourquoi, combien de temps elles sont conservées et comment les supprimer.",
    intro:
      "Watcher rassemble vos abonnements YouTube et Twitch dans un seul flux. Pour cela, il a besoin d'un minimum de données, et uniquement de celles-là. Cette page explique lesquelles, ce que nous en faisons, et comment vous gardez la main dessus.",
    sections: [
      {
        title: "Qui est responsable de vos données",
        blocks: [
          `Le responsable du traitement est ${info.publisher}, ${info.address}. Pour toute question sur vos données, écrivez à [${info.email}](mailto:${info.email}).`,
        ],
      },
      {
        title: "Les données que nous collectons",
        blocks: [
          "Lorsque vous vous connectez et utilisez Watcher, nous enregistrons :",
          [
            "votre compte : le nom affiché de votre profil Google ou Twitch, l'identifiant de ce compte chez le fournisseur, et les dates de création et de dernière connexion ;",
            "les accès fournis par Google et Twitch (tokens OAuth), chiffrés en AES-256-GCM ; ils servent uniquement à lire vos abonnements ;",
            "vos abonnements : la liste des chaînes YouTube auxquelles vous êtes abonné et des chaînes Twitch que vous suivez ;",
            "votre utilisation de Watcher : vos favoris, les chaînes et vidéos que vous avez masquées, et votre position de lecture dans chaque vidéo ;",
            "vos passkeys, si vous en créez : la clé publique, le nom que vous leur donnez, le type d'appareil et les dates d'utilisation. Votre clé privée et vos données biométriques ne quittent jamais votre appareil ;",
            "vos sessions : le navigateur utilisé (user agent), les dates de connexion et d'activité ;",
            "votre adresse IP, de façon temporaire, pour limiter les tentatives de connexion abusives ;",
            "des journaux techniques (requêtes, erreurs), rattachés à votre identifiant Watcher, pour diagnostiquer les problèmes.",
          ],
          "Twitch transmet aussi votre adresse email lors de la connexion : Watcher ne la conserve pas.",
        ],
      },
      {
        title: "Ce que nous ne faisons pas",
        blocks: [
          [
            "Watcher n'a aucun mot de passe à vous demander, et n'en stocke aucun.",
            "Watcher ne publie rien, ne modifie rien et ne s'abonne à rien sur vos comptes YouTube ou Twitch : l'accès est en lecture seule.",
            "Pas de publicité, pas de traceur publicitaire, pas d'outil de mesure d'audience tiers.",
            "Vos données ne sont ni vendues, ni louées, ni partagées à des fins commerciales.",
          ],
        ],
      },
      {
        title: "Pourquoi nous les utilisons",
        blocks: [
          [
            "Faire fonctionner le service, c'est-à-dire afficher votre flux, vos favoris et reprendre vos vidéos là où vous vous êtes arrêté : c'est l'exécution du service que vous demandez en créant votre compte.",
            "Sécuriser votre compte et le service (sessions révocables, limitation des tentatives, journaux d'erreurs) : c'est notre intérêt légitime à protéger Watcher et ses utilisateurs.",
          ],
        ],
      },
      {
        title: "Données Google et YouTube",
        blocks: [
          "Watcher utilise les services d'API YouTube. Avec Google, il demande deux autorisations : la lecture seule de votre compte YouTube (pour récupérer vos abonnements) et votre profil de base (pour votre nom).",
          "L'utilisation et le transfert vers toute autre application des informations reçues des API Google respectent le [Règlement sur les données utilisateur des services d'API Google](https://developers.google.com/terms/api-services-user-data-policy), y compris les exigences d'utilisation limitée.",
          "En utilisant Watcher, vous acceptez aussi les [Conditions d'utilisation de YouTube](https://www.youtube.com/t/terms). Google traite vos données selon ses [Règles de confidentialité](https://policies.google.com/privacy).",
          "Vous pouvez retirer à tout moment l'accès de Watcher depuis la page [Autorisations de votre compte Google](https://myaccount.google.com/permissions), et côté Twitch depuis vos [Connexions Twitch](https://www.twitch.tv/settings/connections).",
        ],
      },
      {
        title: "Services tiers",
        blocks: [
          [
            "YouTube (Google) et Twitch, pour récupérer vos abonnements et les vidéos des chaînes que vous suivez.",
            "Le lecteur YouTube intégré, servi depuis youtube-nocookie.com : lorsque vous lancez une vidéo YouTube, Google reçoit votre adresse IP et peut déposer ses propres cookies.",
            "Les vidéos Twitch passent par le serveur de Watcher : Twitch ne reçoit pas votre adresse IP lorsque vous les regardez.",
            "Les miniatures et logos des chaînes sont copiés sur le stockage de Watcher : votre navigateur ne les charge pas depuis YouTube ou Twitch.",
            `L'hébergement est assuré par ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
      {
        title: "Cookies et stockage local",
        blocks: [
          "Watcher n'utilise que des cookies nécessaires à son fonctionnement, qui ne demandent pas de consentement :",
          [
            "un cookie de session, chiffré, qui vous garde connecté ;",
            "un cookie qui retient votre langue ;",
            "le stockage local de votre navigateur, qui retient votre thème (clair ou sombre).",
          ],
        ],
      },
      {
        title: "Combien de temps nous les conservons",
        blocks: [
          [
            "Votre compte, vos abonnements, favoris et progressions : tant que votre compte existe.",
            "Les sessions : 7 jours au plus, ou jusqu'à votre déconnexion.",
            "Les adresses IP utilisées pour limiter les tentatives : une heure au plus.",
            "Les journaux techniques : environ 30 jours.",
          ],
          "Lorsque vous supprimez votre compte depuis les paramètres de l'app, Watcher révoque ses accès chez Google et Twitch, puis efface votre compte, vos accès, vos sessions, vos passkeys, vos favoris, vos masquages et vos progressions. Les chaînes et vidéos publiques, communes à tous les utilisateurs, ne sont pas des données personnelles et restent en place.",
        ],
      },
      {
        title: "Vos droits",
        blocks: [
          `Conformément au RGPD, vous pouvez accéder à vos données, les rectifier, les effacer, demander leur portabilité, limiter leur traitement ou vous y opposer. La suppression est directement disponible dans les paramètres de l'app ; pour le reste, écrivez à [${info.email}](mailto:${info.email}).`,
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la [CNIL](https://www.cnil.fr/fr/plaintes).",
        ],
      },
      {
        title: "Sécurité",
        blocks: [
          "Les accès Google et Twitch sont chiffrés, les sessions sont révocables à tout moment depuis les paramètres, et les actions sensibles (supprimer le compte, lier ou délier un service, gérer vos passkeys) demandent une authentification récente.",
        ],
      },
      {
        title: "Âge minimum",
        blocks: [
          "Watcher s'adresse aux personnes d'au moins 15 ans. En dessous, l'accord d'un parent ou tuteur est nécessaire.",
        ],
      },
      {
        title: "Modifications",
        blocks: [
          "Cette politique peut évoluer avec le service. La date de mise à jour en haut de page indique la dernière version ; en cas de changement important, vous en serez informé dans l'app.",
        ],
      },
    ],
  },

  terms: {
    title: "Conditions d'utilisation",
    description: "Les règles d'utilisation de Watcher et les mentions légales du site.",
    intro:
      "Ces conditions encadrent l'utilisation de Watcher, l'app et ce site. En créant un compte, vous les acceptez. Elles sont écrites pour être lues : si quelque chose n'est pas clair, écrivez-nous.",
    sections: [
      {
        title: "Le service",
        blocks: [
          "Watcher rassemble dans un seul flux les vidéos et les lives des chaînes YouTube et Twitch que vous suivez, avec un lecteur unique, des favoris et la reprise de lecture.",
          "Watcher est gratuit. Des fonctionnalités payantes pourront être proposées plus tard ; elles seront clairement présentées comme telles et rien ne vous sera facturé sans votre accord explicite.",
        ],
      },
      {
        title: "Votre compte",
        blocks: [
          "Vous vous connectez avec Google, Twitch ou une passkey. Vous êtes responsable de l'accès à ces comptes et de ce qui est fait depuis votre session. Si vous pensez que quelqu'un utilise votre compte, révoquez vos sessions depuis les paramètres et écrivez-nous.",
          "Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'app.",
        ],
      },
      {
        title: "Utilisation acceptable",
        blocks: [
          "En utilisant Watcher, vous vous engagez à ne pas :",
          [
            "contourner les limites techniques du service ou tenter d'accéder aux données d'autres utilisateurs ;",
            "extraire massivement des données de Watcher par des moyens automatisés ;",
            "utiliser Watcher pour télécharger, redistribuer ou exploiter commercialement les contenus des créateurs ;",
            "perturber le fonctionnement du service ou de ses fournisseurs.",
          ],
          "En cas de manquement, l'accès au compte concerné peut être suspendu ou supprimé.",
        ],
      },
      {
        title: "Contenus des créateurs",
        blocks: [
          "Les vidéos, lives, miniatures et noms de chaînes affichés dans Watcher appartiennent à leurs créateurs et restent soumis aux conditions de YouTube et de Twitch. Watcher se contente de les afficher pour vous ; il n'en revendique aucun droit.",
          "Watcher n'est ni affilié à, ni approuvé par Twitch Interactive ou YouTube LLC. En utilisant Watcher, vous acceptez aussi les [Conditions d'utilisation de YouTube](https://www.youtube.com/t/terms) et les [Conditions d'utilisation de Twitch](https://www.twitch.tv/p/legal/terms-of-service/).",
        ],
      },
      {
        title: "Disponibilité",
        blocks: [
          "Watcher fait de son mieux pour être disponible et à jour, mais dépend de YouTube et de Twitch : une vidéo peut apparaître avec un peu de retard, et une fonctionnalité peut cesser de marcher si l'un d'eux change ses règles. Le service peut évoluer, être interrompu pour maintenance ou s'arrêter ; dans ce dernier cas, vous serez prévenu à l'avance autant que possible.",
        ],
      },
      {
        title: "Responsabilité",
        blocks: [
          "Watcher est fourni tel quel. Dans les limites prévues par la loi, l'éditeur ne peut être tenu responsable des interruptions du service, des contenus publiés par les créateurs, ni des décisions de YouTube ou de Twitch.",
        ],
      },
      {
        title: "Données personnelles",
        blocks: [
          "La façon dont Watcher traite vos données est décrite dans la [politique de confidentialité](privacy).",
        ],
      },
      {
        title: "Modifications et droit applicable",
        blocks: [
          "Ces conditions peuvent évoluer ; en cas de changement important, vous en serez informé dans l'app. Elles sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action ; à défaut, les tribunaux français sont compétents.",
          "Ces conditions existent en plusieurs langues ; en cas de différence, la version française fait foi.",
        ],
      },
      {
        title: "Mentions légales",
        blocks: [
          [
            `Éditeur : ${info.publisher}, ${info.status}, ${info.address}. ${info.siret}.`,
            `Directeur de la publication : ${info.publisher}.`,
            `Contact : [${info.email}](mailto:${info.email}).`,
            `Hébergeur : ${info.host}, ${info.host_address}.`,
          ],
        ],
      },
    ],
  },
});
