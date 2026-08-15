"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    dialogues.js

    Gestion :
    - des dialogues ;
    - des variantes de relation ;
    - des variantes de confiance ;
    - des indicateurs d’écriture ;
    - des sons propres aux personnages ;
    - des succès ;
    - des choix importants ;
    - des nouvelles informations ;
    - des fonds définis dans les dialogues.
=========================================================*/

const dialogueManager = {

    conteneur: null,

    /*
        Identifiant permettant d'annuler une ancienne
        séquence de dialogues lorsqu'une nouvelle scène
        est chargée.
    */

    sequenceAffichage: 0,

    /*
        Réglages du délai d'écriture automatique.

        Le temps d'écriture est calculé selon
        le nombre de caractères du message.
    */

    dureeEcritureMinimum: 650,

    dureeEcritureMaximum: 3200,

    dureeParCaractere: 32,

    pauseEntreMessages: 180,

    /*
        Mémorise le dernier personnage ayant produit
        un son de dialogue.
    */

    dernierPersonnageSonore: null,

    /*
        Association entre les personnages et les fichiers
        présents dans le dossier audio/sons/.
    */

    sonsPersonnages: {

        joueur: "joueur",

        eva: "eva",

        zoe: "zoe",

        emelyne: "emelyne",

        bryan: "bryan",

        christophe: "christophe",

        "lieutenant-morel":
            "lieutenant-morel",

        eleve: "eleve",

        sms: "notification",

        telephone: "notification"

    },


    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById(
                "texte"
            );


        if (!this.conteneur) {

            console.error(
                "dialogues.js : l'élément #texte est introuvable."
            );

            return;

        }


        console.log(
            "dialogueManager initialisé."
        );

    },


    /*=====================================================
        VÉRIFIER AUDIO MANAGER
    =====================================================*/

    audioDisponible() {

        return (

            typeof audioManager !==
                "undefined" &&

            audioManager !== null &&

            typeof audioManager
                .jouerSon ===
                "function"

        );

    },


    /*=====================================================
        JOUER UN EFFET SONORE
    =====================================================*/

    jouerEffetSonore(
        nomSon,
        volume = undefined
    ) {

        if (!this.audioDisponible()) {

            return;

        }


        if (
            typeof nomSon !==
                "string" ||

            nomSon.trim() ===
                ""
        ) {

            return;

        }


        const nom =
            nomSon.trim();


        /*
            Si un volume est fourni, il est transmis
            à audioManager.

            Sinon audioManager utilise son volume
            d'effets sonores par défaut.
        */

        if (
            typeof volume ===
                "number" &&

            Number.isFinite(
                volume
            )
        ) {

            audioManager.jouerSon(

                nom,

                Math.max(

                    0,

                    Math.min(
                        1,
                        volume
                    )

                )

            );

            return;

        }


        audioManager.jouerSon(
            nom
        );

    },


    /*=====================================================
        IDENTIFIER UN ÉVÉNEMENT SONORE
    =====================================================*/

    obtenirEvenementSonore(
        message
    ) {

        if (!message) {

            return "";

        }


        const evenement =
            String(

                message.evenement ||

                message.événement ||

                message.typeNotification ||

                ""

            )
                .toLowerCase()

                .normalize(
                    "NFD"
                )

                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )

                .trim();


        switch (evenement) {

            case "succes":

            case "success":

            case "achievement":

                return "succes";


            case "choix-important":

            case "choix important":

            case "choix_important":

            case "important":

                return "choix-important";


            case "information-personnage":

            case "information personnage":

            case "nouvelle-information":

            case "nouvelle information":

            case "revelation-personnage":

                return "information-personnage";


            default:

                return "";

        }

    },


    /*=====================================================
        JOUER LE SON D'UN DIALOGUE
    =====================================================*/

    jouerSonDialogue(
        message
    ) {

        if (!message) {

            return;

        }


        if (!this.audioDisponible()) {

            return;

        }


        /*
            Aucun son automatique.

            Un son est joué uniquement si le message JSON
            contient explicitement une propriété "son".
        */

        if (
            typeof message.son !==
                "string" ||

            message.son.trim() ===
                ""
        ) {

            return;

        }


        const nomSon =
            message.son.trim();


        /*
            Permet de désactiver explicitement le son.

            Exemple JSON :

            "son": "aucun"
        */

        if (
            nomSon.toLowerCase() ===
                "aucun" ||

            nomSon.toLowerCase() ===
                "aucune"
        ) {

            return;

        }


        this.jouerEffetSonore(

            nomSon,

            message.volumeSon

        );

    },
        /*=====================================================
        REMPLACER LES VARIABLES DANS LES TEXTES
    =====================================================*/

    remplacerVariables(
        texte
    ) {

        let resultat =
            String(
                texte || ""
            );


        let nomJoueur =
            "Joueur";


        if (
            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            nomJoueur =
                String(
                    moteur.joueur.nom
                ).trim();

        }


        resultat =
            resultat

                .replaceAll(
                    "{{nomJoueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom du joueur}}",
                    nomJoueur
                )

                .replaceAll(
                    "{{nom_du_joueur}}",
                    nomJoueur
                );


        return resultat;

    },


    /*=====================================================
        OBTENIR LA RELATION D'UN PERSONNAGE
    =====================================================*/

    obtenirRelationPersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesRelation = {

            eva:
                "relationEva",

            zoe:
                "relationZoe",

            emelyne:
                "relationEmelyne",

            bryan:
                "relationBryan",

            christophe:
                "relationChristophe"

        };


        const variable =
            variablesRelation[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        OBTENIR LA CONFIANCE D'UN PERSONNAGE
    =====================================================*/

    obtenirConfiancePersonnage(
        personnage
    ) {

        if (
            typeof moteur ===
                "undefined" ||

            !moteur.joueur
        ) {

            return 0;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const variablesConfiance = {

            eva:
                "confianceEva",

            zoe:
                "confianceZoe",

            emelyne:
                "confianceEmelyne",

            bryan:
                "confianceBryan",

            christophe:
                "confianceChristophe"

        };


        const variable =
            variablesConfiance[
                type
            ];


        if (!variable) {

            return 0;

        }


        const valeur =
            Number(
                moteur.joueur[
                    variable
                ]
            );


        if (
            !Number.isFinite(
                valeur
            )
        ) {

            return 0;

        }


        return valeur;

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE RELATION
    =====================================================*/

    obtenirNiveauRelation(
        personnage
    ) {

        const relation =
            this.obtenirRelationPersonnage(
                personnage
            );


        if (
            relation < 0
        ) {

            return "negative";

        }


        if (
            relation < 5
        ) {

            return "neutre";

        }


        if (
            relation < 10
        ) {

            return "amicale";

        }


        return "proche";

    },


    /*=====================================================
        DÉTERMINER LE NIVEAU DE CONFIANCE
    =====================================================*/

    obtenirNiveauConfiance(
        personnage
    ) {

        const confiance =
            this.obtenirConfiancePersonnage(
                personnage
            );


        if (
            confiance < 0
        ) {

            return "negative";

        }


        if (
            confiance < 5
        ) {

            return "faible";

        }


        if (
            confiance < 10
        ) {

            return "moyenne";

        }


        return "haute";

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA RELATION
    =====================================================*/

    obtenirTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        /*
            Format simple :

            {
                "personnage": "eva",
                "texte": "Salut."
            }
        */

        if (
            !message.variantes ||

            typeof message.variantes !==
                "object"
        ) {

            return (
                message.texte ||
                ""
            );

        }


        const personnageReference =

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauRelation(
                personnageReference
            );


        return (

            message.variantes[
                niveau
            ] ||

            message.variantes.neutre ||

            message.variantes.amicale ||

            message.variantes.proche ||

            message.variantes.negative ||

            message.texte ||

            ""

        );

    },


    /*=====================================================
        CHOISIR LE TEXTE SELON LA CONFIANCE
    =====================================================*/

    obtenirTexteConfiance(
        message
    ) {

        if (!message) {

            return "";

        }


        if (
            !message.variantesConfiance ||

            typeof message
                .variantesConfiance !==
                "object"
        ) {

            return this.obtenirTexteMessage(
                message
            );

        }


        const personnageReference =

            message.confianceAvec ||

            message.relationAvec ||

            message.personnage ||

            message.type ||

            "narrateur";


        const niveau =
            this.obtenirNiveauConfiance(
                personnageReference
            );


        return (

            message.variantesConfiance[
                niveau
            ] ||

            message.variantesConfiance.faible ||

            message.texte ||

            this.obtenirTexteMessage(
                message
            ) ||

            ""

        );

    },


    /*=====================================================
        OBTENIR LE TEXTE FINAL
    =====================================================*/

    preparerTexteMessage(
        message
    ) {

        if (!message) {

            return "";

        }


        let texte =
            "";


        /*
            Les variantes de confiance ont la priorité
            sur les variantes de relation.
        */

        if (
            message.variantesConfiance
        ) {

            texte =
                this.obtenirTexteConfiance(
                    message
                );

        }
        else {

            texte =
                this.obtenirTexteMessage(
                    message
                );

        }


        return this.remplacerVariables(
            texte
        );

    },
        /*=====================================================
        VIDER LA CONVERSATION
    =====================================================*/

    vider() {

        if (!this.conteneur) {

            this.initialiser();

        }

        if (!this.conteneur) {

            return;

        }

        /*
            Augmenter cette valeur annule les indicateurs
            d'écriture et les dialogues encore en attente.
        */

        this.sequenceAffichage += 1;

        this.conteneur.innerHTML =
            "";

        /*
            Le premier personnage de la prochaine scène
            pourra de nouveau produire son son.
        */

        this.dernierPersonnageSonore =
            null;

    },


    /*=====================================================
        AFFICHER UNE SCÈNE
    =====================================================*/

    async afficherScene(
        scene
    ) {

        if (!scene) {

            console.error(
                "dialogues.js : scène invalide."
            );

            return;

        }

        /*
            Chaque nouvelle scène reçoit son propre numéro.

            Si une autre scène démarre pendant les délais,
            l'ancienne séquence s'arrête automatiquement.
        */

        const sequence =
            ++this.sequenceAffichage;

        /*
            Nouveau format :

            {
                "dialogues": [
                    {
                        "personnage": "eva",
                        "texte": "Salut."
                    }
                ]
            }

            Ancien format :

            {
                "personnage": "eva",
                "texte": "Salut."
            }
        */

        const dialogues =
            Array.isArray(
                scene.dialogues
            )

                ? scene.dialogues

                : scene.texte

                    ? [

                        {

                            ...scene,

                            texte:
                                scene.texte,

                            personnage:

                                scene.personnage ||

                                "narrateur"

                        }

                    ]

                    : [];

        /*
            Les messages sont parcourus avec une boucle
            asynchrone pour qu'ils apparaissent dans l'ordre.
        */

        for (
            const message
            of dialogues
        ) {

            /*
                Une nouvelle scène a commencé :
                on abandonne cette ancienne séquence.
            */

            if (
                sequence !==
                this.sequenceAffichage
            ) {

                return;

            }

            if (!message) {

                continue;

            }

            /*
                Applique le fond défini directement
                dans le dialogue avant l'indicateur
                d'écriture et avant l'apparition
                de la bulle.

                Exemple JSON :

                {
                    "personnage": "narrateur",
                    "texte": "Tu arrives à la cafétéria.",
                    "fond": "cafeteria_arrivee"
                }
            */

            if (
                typeof moteur !==
                    "undefined" &&

                typeof moteur
                    .gererFondDialogue ===
                    "function"
            ) {

                moteur.gererFondDialogue(
                    message
                );

            }

            const texteMessage =
                this.preparerTexteMessage(
                    message
                );

            if (!texteMessage) {

                continue;

            }

            const personnage =

                message.personnage ||

                message.type ||

                "narrateur";

            const type =
                this.normaliserPersonnage(
                    personnage
                );

            /*
                L'indicateur d'écriture est affiché
                automatiquement pour les personnages.

                Il ne s'affiche pas par défaut pour :

                - la narration ;
                - les pensées ;
                - le système.

                Le JSON peut forcer ou désactiver ce
                comportement avec :

                "afficherEcriture": true

                ou :

                "afficherEcriture": false
            */

            const afficherEcriture =

                message.afficherEcriture ===
                    true ||

                (

                    message.afficherEcriture !==
                        false &&

                    type !==
                        "narration" &&

                    type !==
                        "pensee" &&

                    type !==
                        "systeme"

                );

            if (
                afficherEcriture
            ) {

                const duree =
                    this.calculerDureeEcriture(

                        texteMessage,

                        message

                    );

                const termine =
                    await this
                        .afficherIndicateurEcriture(

                            personnage,

                            duree,

                            sequence

                        );

                /*
                    L'indicateur a été interrompu par
                    le chargement d'une nouvelle scène.
                */

                if (!termine) {

                    return;

                }

            }
                        /*
                Vérification supplémentaire avant
                l'ajout du véritable message.
            */

            if (
                sequence !==
                this.sequenceAffichage
            ) {

                return;

            }


            this.ajouterMessage(

                texteMessage,

                personnage,

                message

            );


            /*
                Petite pause après le message avant que
                le personnage suivant commence à écrire.

                Personnalisation possible dans le JSON :

                "pauseApres": 500
            */

            const pause =
                Number.isFinite(

                    Number(
                        message.pauseApres
                    )

                )
                    ? Math.max(

                        0,

                        Number(
                            message.pauseApres
                        )

                    )

                    : this.pauseEntreMessages;


            if (
                pause > 0
            ) {

                await this.attendre(
                    pause
                );

            }

        }

    },


    /*=====================================================
        CALCULER LE TEMPS D'ÉCRITURE
    =====================================================*/

    calculerDureeEcriture(
        texte,
        options = {}
    ) {

        /*
            Une durée précise peut être déclarée
            directement dans le JSON :

            "dureeEcriture": 1500
        */

        if (
            Number.isFinite(

                Number(
                    options.dureeEcriture
                )

            )
        ) {

            return Math.max(

                0,

                Number(
                    options.dureeEcriture
                )

            );

        }


        /*
            Retire les éventuelles balises HTML afin
            qu'elles ne soient pas comptées comme du texte.

            Exemple :

            <strong>Salut</strong>

            compte uniquement les lettres de "Salut".
        */

        const texteSansBalises =
            String(
                texte || ""
            )
                .replace(
                    /<[^>]*>/g,
                    ""
                )
                .trim();


        /*
            Chaque message peut modifier localement
            les réglages du temps d'écriture.
        */

        const minimum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMinimum
                )

            )
                ? Number(
                    options.dureeEcritureMinimum
                )

                : this.dureeEcritureMinimum;


        const maximum =
            Number.isFinite(

                Number(
                    options.dureeEcritureMaximum
                )

            )
                ? Number(
                    options.dureeEcritureMaximum
                )

                : this.dureeEcritureMaximum;


        const parCaractere =
            Number.isFinite(

                Number(
                    options.dureeParCaractere
                )

            )
                ? Number(
                    options.dureeParCaractere
                )

                : this.dureeParCaractere;


        const dureeCalculee =

            texteSansBalises.length *

            Math.max(
                0,
                parCaractere
            );


        /*
            La durée reste comprise entre le minimum
            et le maximum configurés.
        */

        return Math.min(

            Math.max(

                minimum,

                dureeCalculee

            ),

            Math.max(

                minimum,

                maximum

            )

        );

    },


    /*=====================================================
        AFFICHER L'INDICATEUR D'ÉCRITURE
    =====================================================*/

    async afficherIndicateurEcriture(
        personnage,
        duree,
        sequence =
            this.sequenceAffichage
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return false;

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*
            Conteneur complet de l'indicateur.
        */

        const indicateur =
            document.createElement(
                "div"
            );


        indicateur.classList.add(

            "message-ecriture",

            type

        );


        /*
            Ligne contenant :

            Eva écrit…
        */

        const ligneNom =
            document.createElement(
                "div"
            );


        ligneNom.classList.add(
            "indicateur-ecriture"
        );


        const nom =
            document.createElement(
                "span"
            );


        nom.classList.add(
            "nom-ecriture"
        );


        nom.textContent =
            this.obtenirNom(
                type
            );


        const statut =
            document.createElement(
                "span"
            );


        statut.classList.add(
            "texte-ecriture"
        );


        statut.textContent =
            "écrit…";


        ligneNom.appendChild(
            nom
        );


        ligneNom.appendChild(
            statut
        );


        /*
            Bulle contenant les trois points.
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle-ecriture"
        );


        /*
            Accessibilité pour les lecteurs d'écran.
        */

        bulle.setAttribute(
            "role",
            "status"
        );


        bulle.setAttribute(

            "aria-label",

            `${this.obtenirNom(type)} écrit`

        );


        /*
            Création des trois points animés.
        */

        for (
            let index = 0;
            index < 3;
            index += 1
        ) {

            const point =
                document.createElement(
                    "span"
                );


            point.classList.add(
                "point-ecriture"
            );


            point.setAttribute(
                "aria-hidden",
                "true"
            );


            bulle.appendChild(
                point
            );

        }


        indicateur.appendChild(
            ligneNom
        );


        indicateur.appendChild(
            bulle
        );


        this.conteneur.appendChild(
            indicateur
        );


        this.defiler();


        /*
            L'indicateur reste visible pendant la durée
            calculée selon la longueur du message.
        */

        await this.attendre(
            duree
        );


        /*
            Il est retiré avant l'apparition
            de la véritable bulle.
        */

        indicateur.remove();


        /*
            Retourne false si une autre scène a été
            chargée pendant l'attente.
        */

        return (

            sequence ===
            this.sequenceAffichage

        );

    },
        /*=====================================================
        AJOUTER UN MESSAGE
    =====================================================*/

    ajouterMessage(
        contenu,
        personnage = "narrateur",
        options = {}
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return null;

        }


        /*
            Applique le fond lorsque ajouterMessage()
            est appelé directement.

            Cela permet notamment aux messages issus
            des choix de changer eux aussi le décor.

            Exemple :

            {
                "personnage": "joueur",
                "texte": "Je vais l'aider.",
                "fond": "cafeteria_action_joueur"
            }
        */

        if (
            options &&
            typeof options ===
                "object" &&

            typeof moteur !==
                "undefined" &&

            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            moteur.gererFondDialogue(
                options
            );

        }


        const type =
            this.normaliserPersonnage(
                personnage
            );


        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        /*
            Conteneur principal du message.
        */

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        /*
            Ajoute une classe différente selon
            le sens du message.

            Le CSS utilise ces classes pour faire glisser
            légèrement la bulle avant de la stabiliser.
        */

        if (
            type === "joueur"
        ) {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        /*
            Nom du personnage.

            Le nom ne s'affiche pas pour :

            - la narration ;
            - les pensées.
        */

        if (
            type !== "narration" &&

            type !== "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                this.obtenirNom(
                    type
                );


            message.appendChild(
                nom
            );

        }


        /*
            Création de la bulle.
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        /*
            innerHTML permet de conserver les balises
            utilisées dans le JSON comme :

            <br>
            <strong>
            <em>
        */

        bulle.innerHTML =
            contenuPrepare;


        message.appendChild(
            bulle
        );


        /*
            Ajout du message dans la conversation.
        */

        this.conteneur.appendChild(
            message
        );


        /*
            Déclenchement du son du personnage
            au moment où le véritable message apparaît.
        */

        this.jouerSonDialogue({

            ...options,

            personnage:

                options.personnage ||

                options.type ||

                personnage

        });


        /*
            Compatibilité avec animationManager.

            L'animation CSS du nouveau style fonctionne
            même si animationManager n'existe pas.
        */

        if (
            typeof animationManager !==
                "undefined" &&

            animationManager !== null
        ) {

            if (
                type === "joueur" &&

                typeof animationManager.envoi ===
                    "function"
            ) {

                animationManager.envoi(
                    message
                );

            }
            else if (
                type !== "joueur" &&

                typeof animationManager.reception ===
                    "function"
            ) {

                animationManager.reception(
                    message
                );

            }

        }


        /*
            Fait défiler automatiquement la conversation
            vers le nouveau message.
        */

        this.defiler();


        return message;

    },


    /*=====================================================
        MESSAGE PROGRESSIF
    =====================================================*/

    async ecrireProgressivement(
        contenu,
        personnage = "narrateur",
        vitesse = 20,
        options = {}
    ) {

        if (!this.conteneur) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return null;

        }


        /*
            Applique le fond associé à ce message
            avant l'indicateur d'écriture.

            Cette partie est utile si un dialogue est
            affiché avec ecrireProgressivement() plutôt
            qu'avec afficherScene().
        */

        if (
            options &&
            typeof options ===
                "object" &&

            typeof moteur !==
                "undefined" &&

            typeof moteur
                .gererFondDialogue ===
                "function"
        ) {

            moteur.gererFondDialogue(
                options
            );

        }


        const contenuPrepare =
            this.remplacerVariables(
                contenu
            );


        const type =
            this.normaliserPersonnage(
                personnage
            );


        /*
            Numéro de la séquence au moment où
            l'écriture progressive commence.

            Si une autre scène est chargée, cette écriture
            pourra être interrompue.
        */

        const sequence =
            this.sequenceAffichage;


        /*
            Affiche d'abord les trois points animés,
            sauf si cela a été désactivé.
        */

        const afficherEcriture =

            options.afficherEcriture === true ||

            (

                options.afficherEcriture !== false &&

                type !== "narration" &&

                type !== "pensee" &&

                type !== "systeme"

            );


        if (
            afficherEcriture
        ) {

            const duree =
                this.calculerDureeEcriture(

                    contenuPrepare,

                    options

                );


            const termine =
                await this
                    .afficherIndicateurEcriture(

                        personnage,

                        duree,

                        sequence

                    );


            if (!termine) {

                return null;

            }

        }


        if (
            sequence !==
                this.sequenceAffichage
        ) {

            return null;

        }


        /*
            Conteneur principal du message.
        */

        const message =
            document.createElement(
                "div"
            );


        message.classList.add(
            "message",
            type
        );


        if (
            type === "joueur"
        ) {

            message.classList.add(
                "envoye"
            );

        }
        else {

            message.classList.add(
                "recu"
            );

        }


        /*
            Nom du personnage.
        */

        if (
            type !== "narration" &&

            type !== "pensee"
        ) {

            const nom =
                document.createElement(
                    "div"
                );


            nom.classList.add(
                "nom"
            );


            nom.textContent =
                this.obtenirNom(
                    type
                );


            message.appendChild(
                nom
            );

        }


        /*
            Création de la bulle vide.

            Le texte sera ajouté caractère par caractère.
        */

        const bulle =
            document.createElement(
                "div"
            );


        bulle.classList.add(
            "bulle"
        );


        message.appendChild(
            bulle
        );


        this.conteneur.appendChild(
            message
        );


        /*
            Joue le son une seule fois lorsque
            la bulle apparaît.
        */

        this.jouerSonDialogue({

            ...options,

            personnage:

                options.personnage ||

                options.type ||

                personnage

        });


        this.defiler();


        /*
            Conversion de la vitesse en nombre valide.

            Plus la valeur est faible,
            plus le texte s'écrit rapidement.
        */

        const delai =
            Math.max(

                0,

                Number(
                    vitesse
                ) || 0

            );


        let texteAffiche =
            "";


        /*
            Écriture caractère par caractère.
        */

        for (
            let index = 0;
            index < contenuPrepare.length;
            index += 1
        ) {

            /*
                Arrêt si une nouvelle scène est chargée.
            */

            if (
                sequence !==
                    this.sequenceAffichage
            ) {

                message.remove();

                return null;

            }


            texteAffiche +=
                contenuPrepare[
                    index
                ];


            bulle.textContent =
                texteAffiche;


            this.defiler();


            /*
                Les ponctuations créent une petite pause
                supplémentaire pour rendre l'écriture
                plus naturelle.
            */

            const caractere =
                contenuPrepare[
                    index
                ];


            let delaiActuel =
                delai;


            if (
                caractere === "." ||

                caractere === "!" ||

                caractere === "?"
            ) {

                delaiActuel +=
                    180;

            }
            else if (
                caractere === "," ||

                caractere === ";" ||

                caractere === ":"
            ) {

                delaiActuel +=
                    80;

            }


            await this.attendre(
                delaiActuel
            );

        }


        /*
            Lance éventuellement les animations
            supplémentaires de animationManager.
        */

        if (
            typeof animationManager !==
                "undefined" &&

            animationManager !== null
        ) {

            if (
                type === "joueur" &&

                typeof animationManager.envoi ===
                    "function"
            ) {

                animationManager.envoi(
                    message
                );

            }
            else if (
                type !== "joueur" &&

                typeof animationManager.reception ===
                    "function"
            ) {

                animationManager.reception(
                    message
                );

            }

        }


        return message;

    },
        /*=====================================================
        NORMALISER LE PERSONNAGE
    =====================================================*/

    normaliserPersonnage(
        personnage
    ) {

        const valeur =
            String(
                personnage ||
                "narrateur"
            )
                .toLowerCase()

                .normalize(
                    "NFD"
                )

                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )

                .trim();


        switch (
            valeur
        ) {

            case "joueur":

            case "toi":

            case "vous":

            case "player":

                return "joueur";


            case "eva":

                return "eva";


            case "zoe":

                return "zoe";


            case "emelyne":

                return "emelyne";


            case "bryan":

                return "bryan";


            case "christophe":

                return "christophe";


            case "lieutenant morel":

            case "lieutenant-morel":

            case "morel":

                return "lieutenant-morel";


            case "eleve":

            case "etudiant":

            case "etudiante":

                return "eleve";


            case "systeme":

                return "systeme";


            case "sms":

            case "message":

            case "texto":

                return "sms";


            case "telephone":

            case "appel":

                return "telephone";


            case "pensee":

                return "pensee";


            case "narration":

            case "narrateur":

                return "narration";


            default:

                /*
                    Un personnage inconnu devient une
                    narration pour éviter une classe CSS
                    ou un fichier audio inexistant.
                */

                return "narration";

        }

    },


    /*=====================================================
        NOM AFFICHÉ
    =====================================================*/

    obtenirNom(
        personnage
    ) {

        if (
            personnage === "joueur" &&

            typeof moteur !==
                "undefined" &&

            moteur.joueur &&

            moteur.joueur.nom
        ) {

            return String(
                moteur.joueur.nom
            );

        }


        const noms = {

            joueur:
                "Joueur",

            eva:
                "Eva",

            zoe:
                "Zoé",

            emelyne:
                "Émelyne",

            bryan:
                "Bryan",

            christophe:
                "Christophe",

            "lieutenant-morel":
                "Lieutenant Morel",

            eleve:
                "Élève",

            systeme:
                "Système",

            sms:
                "Message",

            telephone:
                "Téléphone",

            narration:
                "Narrateur",

            pensee:
                "Pensée"

        };


        return (

            noms[
                personnage
            ] ||

            personnage

        );

    },


    /*=====================================================
        MESSAGE SYSTÈME ORDINAIRE
    =====================================================*/

    systeme(
        texte,
        options = {}
    ) {

        if (!texte) {

            return null;

        }


        /*
            Un message système ordinaire reste silencieux.

            Pour produire le son système, utilise plutôt :

            dialogueManager.nouvelleInformation(...)
        */

        return this.ajouterMessage(

            texte,

            "systeme",

            {

                ...options,

                personnage:
                    "systeme",

                son:
                    options.son ||
                    "aucun"

            }

        );

    },


    /*=====================================================
        NOUVELLE INFORMATION SUR UN PERSONNAGE
    =====================================================*/

    nouvelleInformation(
        texte,
        personnageConcerne = null,
        options = {}
    ) {

        if (!texte) {

            return null;

        }


        return this.ajouterMessage(

            texte,

            "systeme",

            {

                ...options,

                personnage:
                    "systeme",

                evenement:
                    "information-personnage",

                nouvelleInformation:
                    true,

                personnageConcerne,

                son:
                    options.son ||
                    "systeme"

            }

        );

    },


    /*=====================================================
        AFFICHER UN SUCCÈS
    =====================================================*/

    succes(
        texte,
        options = {}
    ) {

        if (!texte) {

            return null;

        }


        /*
            Si demandé, le succès apparaît dans la
            conversation.
        */

        if (
            options.dansConversation ===
                true
        ) {

            return this.ajouterMessage(

                texte,

                "systeme",

                {

                    ...options,

                    evenement:
                        "succes",

                    personnage:
                        "systeme",

                    son:
                        options.son ||
                        "succes"

                }

            );

        }


        /*
            Sinon, il apparaît sous forme
            de notification.
        */

        this.notification(

            texte,

            {

                ...options,

                evenement:
                    "succes",

                son:
                    options.son ||
                    "succes",

                classe:
                    "notification-succes"

            }

        );


        return null;

    },
        /*=====================================================
        SIGNALER UN CHOIX IMPORTANT
    =====================================================*/

    choixImportant(
        texte = "",
        options = {}
    ) {

        /*
            Cette fonction peut seulement jouer le son
            ou afficher une notification.

            Exemple sans texte :

            dialogueManager.choixImportant();
        */

        if (!texte) {

            this.jouerSonDialogue({

                evenement:
                    "choix-important",

                son:
                    options.son ||
                    "choix-important",

                volumeSon:
                    options.volumeSon

            });

            return null;

        }


        this.notification(

            texte,

            {

                ...options,

                evenement:
                    "choix-important",

                son:
                    options.son ||
                    "choix-important",

                classe:
                    "notification-choix-important"

            }

        );


        return null;

    },


    /*=====================================================
        NOTIFICATION VISUELLE
    =====================================================*/

    notification(
        texte,
        options = {}
    ) {

        if (!texte) {

            return;

        }


        /*
            Compatibilité avec l'ancien format :

            notification(
                "Texte",
                "notification"
            )
        */

        if (
            typeof options ===
                "string"
        ) {

            options = {

                son:
                    options

            };

        }


        /*
            Création de la notification.
        */

        const notification =
            document.createElement(
                "div"
            );


        notification.classList.add(
            "notification"
        );


        /*
            Ajout éventuel d'une classe personnalisée.
        */

        if (
            typeof options.classe ===
                "string" &&

            options.classe.trim() !==
                ""
        ) {

            notification.classList.add(
                options.classe.trim()
            );

        }


        notification.textContent =
            this.remplacerVariables(
                texte
            );


        document.body.appendChild(
            notification
        );


        /*
            Détermine le type de notification sonore.
        */

        const evenement =
            this.obtenirEvenementSonore(
                options
            );


        if (
            evenement
        ) {

            this.jouerSonDialogue({

                ...options,

                evenement

            });

        }
        else {

            this.jouerEffetSonore(

                options.son ||
                    "notification",

                options.volumeSon

            );

        }


        /*
            Active l'animation d'apparition.
        */

        requestAnimationFrame(
            () => {

                notification.classList.add(
                    "visible"
                );

            }
        );


        /*
            Durée d'affichage de la notification.

            Exemple dans les options :

            {
                duree: 4000
            }
        */

        const duree =
            Number.isFinite(

                Number(
                    options.duree
                )

            )
                ? Math.max(

                    500,

                    Number(
                        options.duree
                    )

                )

                : 2500;


        setTimeout(
            () => {

                notification.classList.remove(
                    "visible"
                );


                /*
                    Attend la fin de l'animation CSS
                    avant de supprimer l'élément.
                */

                setTimeout(
                    () => {

                        notification.remove();

                    },
                    300
                );

            },
            duree
        );

    },


    /*=====================================================
        RÉINITIALISER LE DERNIER PERSONNAGE SONORE
    =====================================================*/

    reinitialiserSonDialogue() {

        this.dernierPersonnageSonore =
            null;

    },
    /*=====================================================
        DÉFILEMENT AUTOMATIQUE
    =====================================================*/

    defiler() {

        const conversation =
            document.getElementById(
                "conversation"
            );


        if (!conversation) {

            return;

        }


        requestAnimationFrame(
            () => {

                conversation.scrollTo({

                    top:
                        conversation.scrollHeight,

                    behavior:
                        "smooth"

                });

            }
        );

    },


    /*=====================================================
        ATTENDRE
    =====================================================*/

    attendre(
        duree
    ) {

        return new Promise(
            resolve => {

                setTimeout(

                    resolve,

                    Math.max(

                        0,

                        Number(
                            duree
                        ) || 0

                    )

                );

            }
        );

    }

};


/*=========================================================
    INITIALISATION AUTOMATIQUE
=========================================================*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        dialogueManager.initialiser();

    }
);