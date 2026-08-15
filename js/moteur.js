"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    moteur.js

    Gestion :
    - chapitres
    - scènes
    - dialogues
    - choix
    - sauvegardes
    - audio
    - fonds dynamiques
=========================================================*/

const moteur = {

    /*=====================================================
        ÉTAT DU JEU
    =====================================================*/

    chapitreActuel: 0,

    sceneActuelle: "",

    chapitre: null,

    joueur: null,


    /*=====================================================
        TIMERS ET ÉLÉMENTS TEMPORAIRES
    =====================================================*/

    timerChoix: null,

    boutonChoix: null,

    timerFond: null,

    transitionChapitreEnCours: false,

    changementFondEnCours: false,


    /*=====================================================
        GESTION DES FONDS
    =====================================================*/

    fondActuel: "",

    cheminFonds: "images/fonds/",

    extensionFondParDefaut: "jpg",

    dureeTransitionFondParDefaut: 500,


    /*=====================================================
        INITIALISATION
    =====================================================*/

    async initialiser() {

        try {

            this.initialiserTransition();

            this.initialiserFond();


            if (
                typeof chapitresManager ===
                "undefined"
            ) {

                throw new Error(
                    "chapitresManager est introuvable."
                );

            }


            if (
                typeof sauvegardeManager ===
                "undefined"
            ) {

                throw new Error(
                    "sauvegardeManager est introuvable."
                );

            }


            await chapitresManager.charger();


            if (
                chapitresManager.nombre() === 0
            ) {

                this.afficherErreur(
                    "Aucun chapitre n'a pu être chargé."
                );

                return;

            }


            /*
                Vérifie si le joueur vient de cliquer
                sur Nouvelle partie depuis le menu.
            */

            const nouvellePartieDemandee =

                localStorage.getItem(
                    "nouvellePartieDemandee"
                ) === "true";


            if (nouvellePartieDemandee) {

                localStorage.removeItem(
                    "nouvellePartieDemandee"
                );


                sauvegardeManager.supprimer();


                this.nouvellePartie();

                return;

            }


            /*
                Charge une sauvegarde existante.
            */

            const sauvegarde =
                sauvegardeManager.charger();


            if (sauvegarde) {

                this.appliquerSauvegarde(
                    sauvegarde
                );

            }
            else {

                this.nouvellePartie();

            }

        }
        catch (erreur) {

            console.error(
                "Erreur d'initialisation du moteur :",
                erreur
            );


            this.afficherErreur(
                "Une erreur est survenue pendant le chargement du jeu."
            );

        }

    },


    /*=====================================================
        INITIALISER LE FOND DU JEU
    =====================================================*/

    initialiserFond() {

        const fond =
            document.getElementById(
                "fond-jeu"
            );


        if (!fond) {

            console.warn(
                "L'élément HTML #fond-jeu est introuvable."
            );

            return;

        }


        /*
            Garantit qu'aucun ancien timer
            de changement de fond ne reste actif.
        */

        this.annulerTransitionFond();


        /*
            Le fond commence sans image.
            La première scène définira son fond.
        */

        fond.style.backgroundImage =
            "none";


        fond.style.opacity =
            "1";


        fond.classList.remove(
            "changement-fond"
        );


        fond.classList.remove(
            "fond-charge"
        );


        this.fondActuel =
            "";

    },


    /*=====================================================
        TRANSITION D'ENTRÉE
    =====================================================*/

    initialiserTransition() {

        const transition =
            document.getElementById(
                "transition"
            );


        if (!transition) {

            return;

        }


        setTimeout(
            () => {

                transition.classList.remove(
                    "actif"
                );


                transition.style.opacity =
                    "0";

            },
            100
        );

    },


    /*=====================================================
        DEMANDER LE NOM DU JOUEUR
    =====================================================*/

    demanderNomJoueur() {

        let nomChoisi =
            window.prompt(

                "Quel est le prénom de ton personnage ?",

                "Mikael"

            );


        nomChoisi =
            String(
                nomChoisi || ""
            ).trim();


        if (
            nomChoisi.length < 2
        ) {

            nomChoisi =
                "Joueur";

        }


        if (
            nomChoisi.length > 20
        ) {

            nomChoisi =
                nomChoisi.substring(
                    0,
                    20
                );

        }


        return nomChoisi;

    },


    /*=====================================================
        NOUVELLE PARTIE
    =====================================================*/

    nouvellePartie() {

        const premierChapitre =
            chapitresManager.obtenir(
                0
            );


        if (!premierChapitre) {

            this.afficherErreur(
                "Le chapitre 1 est introuvable."
            );

            return;

        }


        this.annulerTransitionFond();


        this.chapitreActuel =
            0;


        this.sceneActuelle =
            premierChapitre.debut;


        this.chapitre =
            premierChapitre;


        this.fondActuel =
            "";


        this.joueur =
            sauvegardeManager
                .creerJoueurParDefaut();


        /*
            Demande le prénom avant
            de créer la sauvegarde.
        */

        this.joueur.nom =
            this.demanderNomJoueur();


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .vider ===
                "function"
        ) {

            dialogueManager.vider();

        }


        if (
            typeof audioManager !==
                "undefined" &&
            typeof audioManager
                .toutArreter ===
                "function"
        ) {

            audioManager.toutArreter();

        }


        /*
            Retire l'ancien fond avant de commencer
            une nouvelle partie.
        */

        this.retirerFond(
            0
        );


        this.sauvegarder();


        this.chargerChapitre(

            0,

            this.sceneActuelle

        );

    },
        /*=====================================================
        APPLIQUER UNE SAUVEGARDE
    =====================================================*/

    appliquerSauvegarde(
        sauvegarde
    ) {

        if (!sauvegarde) {

            this.nouvellePartie();

            return;

        }


        this.annulerTransitionFond();


        this.chapitreActuel =
            sauvegarde.chapitre ?? 0;


        this.sceneActuelle =
            sauvegarde.scene || "";


        this.fondActuel =
            sauvegarde.fond || "";


        this.joueur = {

            ...sauvegardeManager
                .creerJoueurParDefaut(),

            ...(sauvegarde.joueur || {})

        };


        /*
            Compatibilité avec les anciennes
            sauvegardes qui ne contiennent
            pas encore de prénom.
        */

        if (
            !this.joueur.nom ||
            String(
                this.joueur.nom
            )
                .trim()
                .toLowerCase() ===
                "joueur"
        ) {

            this.joueur.nom =
                this.demanderNomJoueur();


            this.sauvegarder();

        }


        /*
            Vérifie que le chapitre sauvegardé
            existe toujours.
        */

        const chapitreSauvegarde =
            chapitresManager.obtenir(
                this.chapitreActuel
            );


        if (!chapitreSauvegarde) {

            console.warn(
                "Le chapitre sauvegardé est introuvable. Une nouvelle partie va être lancée."
            );


            this.nouvellePartie();

            return;

        }


        /*
            Si la scène sauvegardée n'existe plus,
            le jeu reprend au début du chapitre.
        */

        if (
            !this.sceneActuelle ||
            !chapitreSauvegarde
                .scenes?.[
                    this.sceneActuelle
                ]
        ) {

            this.sceneActuelle =
                chapitreSauvegarde.debut;

        }


        /*
            Recharge immédiatement le fond sauvegardé
            si une ancienne sauvegarde en contient un.

            Le fond de la scène sera ensuite prioritaire
            lors de chargerScene().
        */

        if (this.fondActuel) {

            this.appliquerFondImmediat(
                this.fondActuel
            );

        }


        this.chargerChapitre(

            this.chapitreActuel,

            this.sceneActuelle

        );

    },


    /*=====================================================
        SAUVEGARDER
    =====================================================*/

    sauvegarder() {

        if (
            typeof sauvegardeManager ===
                "undefined" ||
            typeof sauvegardeManager
                .sauvegarder !==
                "function"
        ) {

            return;

        }


        sauvegardeManager.sauvegarder({

            chapitre:
                this.chapitreActuel,

            scene:
                this.sceneActuelle,

            joueur:
                this.joueur,

            fond:
                this.fondActuel || "",

            musique:

                typeof audioManager !==
                    "undefined"

                    ? audioManager
                        .musiqueActuelle || ""

                    : "",

            ambiance:

                typeof audioManager !==
                    "undefined"

                    ? audioManager
                        .ambianceActuelle || ""

                    : ""

        });

    },


    /*=====================================================
        CHARGER UN CHAPITRE
    =====================================================*/

    chargerChapitre(
        numero,
        sceneDepart = null
    ) {

        const numeroChapitre =
            Number(
                numero
            );


        if (
            !Number.isInteger(
                numeroChapitre
            ) ||
            numeroChapitre < 0
        ) {

            this.afficherErreur(
                "Numéro de chapitre invalide."
            );

            return;

        }


        const chapitre =
            chapitresManager.obtenir(
                numeroChapitre
            );


        if (!chapitre) {

            this.afficherErreur(

                "Chapitre introuvable : " +

                (numeroChapitre + 1)

            );

            return;

        }


        this.annulerAttenteChoix();

        this.annulerTransitionFond();


        this.chapitreActuel =
            numeroChapitre;


        this.chapitre =
            chapitre;


        /*
            Met à jour le titre affiché
            en haut de la page du jeu.
        */

        const titre =
            document.getElementById(
                "titre"
            );


        if (titre) {

            titre.textContent =
                chapitre.titre ||
                `Chapitre ${numeroChapitre + 1}`;

        }


        /*=================================================
            FOND DÉFINI AU NIVEAU DU CHAPITRE
        =================================================*/

        /*
            Le fond du chapitre sert de fond par défaut.

            Une scène peut ensuite le remplacer avec :

            "fond": "cafeteria"
        */

        if (
            Object.prototype.hasOwnProperty.call(
                chapitre,
                "fond"
            )
        ) {

            this.gererFondChapitre(
                chapitre
            );

        }


        /*=================================================
            MUSIQUE DU CHAPITRE
        =================================================*/

        if (
            typeof audioManager !==
                "undefined"
        ) {

            if (
                chapitre.musique ===
                    "aucune" ||
                chapitre.musique ===
                    "aucun" ||
                chapitre.musique ===
                    null
            ) {

                if (
                    typeof audioManager
                        .arreterMusique ===
                        "function"
                ) {

                    audioManager
                        .arreterMusique();

                }

            }
            else if (
                chapitre.musique &&
                typeof audioManager
                    .changerMusique ===
                    "function"
            ) {

                audioManager.changerMusique(

                    chapitre.musique,

                    chapitre
                        .transitionMusique ??
                        800

                );

            }


            /*=============================================
                AMBIANCE DU CHAPITRE
            =============================================*/

            if (
                chapitre.ambiance ===
                    "aucune" ||
                chapitre.ambiance ===
                    "aucun" ||
                chapitre.ambiance ===
                    null
            ) {

                if (
                    typeof audioManager
                        .arreterAmbiance ===
                        "function"
                ) {

                    audioManager
                        .arreterAmbiance();

                }

            }
            else if (
                chapitre.ambiance
            ) {

                if (
                    typeof audioManager
                        .changerAmbiance ===
                        "function"
                ) {

                    audioManager.changerAmbiance(

                        chapitre.ambiance,

                        chapitre
                            .transitionAmbiance ??
                            600,

                        chapitre
                            .volumeAmbiance

                    );

                }
                else if (
                    typeof audioManager
                        .jouerAmbiance ===
                        "function"
                ) {

                    audioManager.jouerAmbiance(

                        chapitre.ambiance,

                        chapitre
                            .volumeAmbiance

                    );

                }

            }

        }


        /*
            La scène de sauvegarde est prioritaire.
            Sinon, le début normal du chapitre
            est utilisé.
        */

        const sceneInitiale =

            sceneDepart ||

            chapitre.debut;


        if (!sceneInitiale) {

            this.afficherErreur(
                "Aucune scène de départ n'est définie."
            );

            return;

        }


        this.chargerScene(
            sceneInitiale
        );

    },
        /*=====================================================
        CHARGER UNE SCÈNE
    =====================================================*/

    chargerScene(
        id
    ) {

        if (!this.chapitre) {

            this.afficherErreur(
                "Aucun chapitre n'est chargé."
            );

            return;

        }


        const idScene =
            String(
                id || ""
            ).trim();


        if (!idScene) {

            this.afficherErreur(
                "Identifiant de scène manquant."
            );

            return;

        }


        const scene =
            this.chapitre
                .scenes?.[
                    idScene
                ];


        if (!scene) {

            this.afficherErreur(

                "Scène introuvable : " +

                idScene

            );

            return;

        }


        /*
            Supprime les anciens timers,
            boutons et fenêtres de choix.
        */

        this.annulerAttenteChoix();


        if (
            typeof choixManager !==
                "undefined"
        ) {

            if (
                typeof choixManager
                    .fermerPopup ===
                    "function"
            ) {

                choixManager.fermerPopup();

            }


            if (
                typeof choixManager
                    .vider ===
                    "function"
            ) {

                choixManager.vider();

            }

        }


        /*=================================================
            VÉRIFICATION DE L'ACCÈS À LA SCÈNE
        =================================================*/

        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .verifierAccesScene ===
                "function"
        ) {

            const accesAutorise =
                conditionsManager
                    .verifierAccesScene(

                        scene,

                        this.joueur

                    );


            if (!accesAutorise) {

                if (scene.sinon) {

                    this.chargerScene(
                        scene.sinon
                    );

                }
                else {

                    this.afficherErreur(
                        "Cette scène n'est pas accessible."
                    );

                }

                return;

            }

        }


        /*=================================================
            REDIRECTION AUTOMATIQUE CONDITIONNELLE
        =================================================*/

        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .obtenirRedirection ===
                "function"
        ) {

            const redirection =
                conditionsManager
                    .obtenirRedirection(

                        scene,

                        this.joueur

                    );


            if (redirection) {

                this.gererDestination(
                    redirection
                );

                return;

            }

        }


        /*
            La scène devient la scène actuelle.
        */

        this.sceneActuelle =
            idScene;


        /*=================================================
            GESTION DU FOND DE LA SCÈNE
        =================================================*/

        this.gererFondScene(
            scene
        );


        /*=================================================
            GESTION DE L'AUDIO DE LA SCÈNE
        =================================================*/

        this.gererAudioScene(
            scene
        );


        /*=================================================
            AFFICHAGE DES DIALOGUES
        =================================================*/

        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .afficherScene ===
                "function"
        ) {

            dialogueManager.afficherScene(
                scene
            );

        }
        else {

            console.error(
                "dialogueManager.afficherScene est introuvable."
            );

        }


        /*=================================================
            PRÉPARATION DES CHOIX
        =================================================*/

        let choixDisponibles =
            Array.isArray(
                scene.choix
            )

                ? [...scene.choix]

                : [];


        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .preparerChoix ===
                "function"
        ) {

            choixDisponibles =
                conditionsManager
                    .preparerChoix(

                        choixDisponibles,

                        this.joueur

                    );

        }


        if (
            !Array.isArray(
                choixDisponibles
            )
        ) {

            console.warn(
                "conditionsManager.preparerChoix n'a pas retourné un tableau."
            );

            choixDisponibles =
                [];

        }


        /*=================================================
            AFFICHAGE DU BOUTON DES CHOIX
        =================================================*/

        if (
            choixDisponibles.length > 0
        ) {

            this.afficherBoutonChoix(
                choixDisponibles
            );

        }
        else if (scene.next) {

            const delaiAutomatique =
                Math.max(

                    0,

                    Number(
                        scene.delai ?? 800
                    )

                );


            this.timerChoix =
                setTimeout(
                    () => {

                        this.timerChoix =
                            null;


                        this.gererDestination(
                            scene.next
                        );

                    },
                    delaiAutomatique
                );

        }
        else {

            console.warn(

                `La scène "${idScene}" ne contient aucun choix ni destination automatique.`

            );

        }


        /*
            Sauvegarde après chargement complet.
        */

        this.sauvegarder();

    },
        /*=====================================================
        GÉRER LE FOND D'UN CHAPITRE
    =====================================================*/

    gererFondChapitre(
        chapitre
    ) {

        if (!chapitre) {

            return;

        }


        const fondChapitre =
            chapitre.fond;


        /*
            Retire le fond si le chapitre demande
            explicitement aucun fond.
        */

        if (
            fondChapitre === null ||
            fondChapitre === "aucun" ||
            fondChapitre === "aucune"
        ) {

            this.retirerFond(

                chapitre.transitionFond ?? 500

            );

            return;

        }


        /*
            Si aucune valeur de fond n'est définie,
            le fond actuel reste affiché.
        */

        if (!fondChapitre) {

            return;

        }


        this.changerFond(

            fondChapitre,

            {

                extension:
                    chapitre.extensionFond,

                transition:
                    chapitre.transitionFond,

                opacite:
                    chapitre.opaciteFond,

                position:
                    chapitre.positionFond,

                taille:
                    chapitre.tailleFond,

                repetition:
                    chapitre.repetitionFond,

                filtre:
                    chapitre.filtreFond,

                immediat:
                    chapitre.fondImmediat === true,

                forcer:
                    chapitre.forcerFond === true

            }

        );

    },


    /*=====================================================
        GÉRER LE FOND D'UNE SCÈNE
    =====================================================*/

    gererFondScene(
        scene
    ) {

        if (!scene) {

            return;

        }


        /*
            Vérifie que la propriété "fond"
            existe réellement dans la scène.

            Si elle n'existe pas, le fond précédent
            reste affiché.
        */

        const possedeFond =
            Object.prototype.hasOwnProperty.call(
                scene,
                "fond"
            );


        if (!possedeFond) {

            return;

        }


        const fondScene =
            scene.fond;


        /*
            Retire complètement le fond
            lorsqu'une scène contient :

            "fond": null

            ou :

            "fond": "aucun"
        */

        if (
            fondScene === null ||
            fondScene === "aucun" ||
            fondScene === "aucune"
        ) {

            this.retirerFond(

                scene.transitionFond ?? 500

            );

            return;

        }


        /*
            Une chaîne vide conserve le fond actuel.
        */

        if (
            typeof fondScene ===
                "string" &&

            fondScene.trim() ===
                ""
        ) {

            return;

        }


        /*
            Charge le fond de la scène.
        */

        this.changerFond(

            fondScene,

            {

                extension:
                    scene.extensionFond,

                transition:
                    scene.transitionFond,

                opacite:
                    scene.opaciteFond,

                position:
                    scene.positionFond,

                taille:
                    scene.tailleFond,

                repetition:
                    scene.repetitionFond,

                filtre:
                    scene.filtreFond,

                immediat:
                    scene.fondImmediat === true,

                forcer:
                    scene.forcerFond === true

            }

        );

    },


    /*=====================================================
        GÉRER LE FOND D'UN DIALOGUE
    =====================================================*/

    gererFondDialogue(
        dialogue
    ) {

        if (
            !dialogue ||
            typeof dialogue !==
                "object"
        ) {

            return;

        }


        /*
            Vérifie que le dialogue contient réellement
            une propriété "fond".

            Sans propriété "fond", le décor actuel
            reste affiché.
        */

        const possedeFond =
            Object.prototype.hasOwnProperty.call(
                dialogue,
                "fond"
            );


        if (!possedeFond) {

            return;

        }


        const fondDialogue =
            dialogue.fond;


        /*
            Retire le fond depuis un dialogue.

            Exemple JSON :

            {
                "personnage": "narrateur",
                "texte": "L'écran devient noir.",
                "fond": "aucun"
            }
        */

        if (
            fondDialogue === null ||
            fondDialogue === "aucun" ||
            fondDialogue === "aucune"
        ) {

            this.retirerFond(

                dialogue.transitionFond ?? 500

            );

            return;

        }


        /*
            Une chaîne vide conserve le fond actuel.
        */

        if (
            typeof fondDialogue ===
                "string" &&

            fondDialogue.trim() ===
                ""
        ) {

            return;

        }


        /*
            Charge le fond associé au dialogue.

            Cette fonction est appelée par dialogue.js
            juste avant l'indicateur d'écriture.
        */

        this.changerFond(

            fondDialogue,

            {

                extension:
                    dialogue.extensionFond,

                transition:
                    dialogue.transitionFond,

                opacite:
                    dialogue.opaciteFond,

                position:
                    dialogue.positionFond,

                taille:
                    dialogue.tailleFond,

                repetition:
                    dialogue.repetitionFond,

                filtre:
                    dialogue.filtreFond,

                immediat:
                    dialogue.fondImmediat === true,

                forcer:
                    dialogue.forcerFond === true

            }

        );

    },
        /*=====================================================
        CHANGER LE FOND DU JEU
    =====================================================*/

    changerFond(
        fond,
        options = {}
    ) {

        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (!elementFond) {

            console.warn(
                "Impossible de changer le fond : #fond-jeu est introuvable."
            );

            return;

        }


        const nomFond =
            String(
                fond || ""
            ).trim();


        if (!nomFond) {

            return;

        }


        /*
            Évite de recharger inutilement
            le même fond.
        */

        if (
            this.fondActuel ===
                nomFond &&
            options.forcer !==
                true
        ) {

            this.appliquerOptionsFond(
                elementFond,
                options
            );

            return;

        }


        this.annulerTransitionFond();


        const cheminFond =
            this.construireCheminFond(

                nomFond,

                options.extension

            );


        const dureeTransition =
            Math.max(

                0,

                Number(

                    options.transition ??

                    this.dureeTransitionFondParDefaut

                )

            );


        /*
            Application immédiate sans fondu.
        */

        if (
            options.immediat ===
                true ||
            dureeTransition ===
                0
        ) {

            this.appliquerFondImmediat(

                nomFond,

                options

            );

            return;

        }


        this.changementFondEnCours =
            true;


        /*
            Précharge l'image avant de lancer
            la transition visuelle.
        */

        this.prechargerFond(
            cheminFond
        )
            .then(
                () => {

                    /*
                        Vérifie qu'aucun autre changement
                        de fond n'a été lancé entre-temps.
                    */

                    if (
                        !this.changementFondEnCours
                    ) {

                        return;

                    }


                    elementFond.classList.add(
                        "changement-fond"
                    );


                    elementFond.classList.remove(
                        "fond-charge"
                    );


                    /*
                        Attend la disparition du fond actuel
                        avant d'appliquer le nouveau.
                    */

                    this.timerFond =
                        setTimeout(
                            () => {

                                elementFond
                                    .style
                                    .backgroundImage =
                                    `url("${cheminFond}")`;


                                this.appliquerOptionsFond(

                                    elementFond,

                                    options

                                );


                                this.fondActuel =
                                    nomFond;


                                /*
                                    Force le navigateur à prendre
                                    en compte la nouvelle image.
                                */

                                void elementFond
                                    .offsetWidth;


                                elementFond
                                    .classList
                                    .remove(
                                        "changement-fond"
                                    );


                                elementFond
                                    .classList
                                    .add(
                                        "fond-charge"
                                    );


                                this.changementFondEnCours =
                                    false;


                                this.timerFond =
                                    null;


                                this.sauvegarder();

                            },
                            dureeTransition
                        );

                }
            )
            .catch(
                erreur => {

                    console.error(

                        `Impossible de charger le fond "${cheminFond}".`,

                        erreur

                    );


                    this.changementFondEnCours =
                        false;


                    this.timerFond =
                        null;

                }
            );

    },


    /*=====================================================
        CONSTRUIRE LE CHEMIN D'UN FOND
    =====================================================*/

    construireCheminFond(
        fond,
        extension = null
    ) {

        const nomFond =
            String(
                fond || ""
            ).trim();


        if (!nomFond) {

            return "";

        }


        /*
            Si un chemin complet est déjà fourni,
            il est utilisé directement.

            Exemples :

            "../images/fonds/classe.jpg"
            "images/fonds/classe.png"
            "/images/fonds/classe.webp"
        */

        if (
            nomFond.includes("/") ||
            nomFond.includes("\\")
        ) {

            return nomFond.replaceAll(
                "\\",
                "/"
            );

        }


        /*
            Si le nom contient déjà une extension,
            aucune extension supplémentaire
            n'est ajoutée.
        */

        const possedeExtension =
            /\.(jpg|jpeg|png|webp|gif|avif)$/i
                .test(
                    nomFond
                );


        if (
            possedeExtension
        ) {

            return (

                this.cheminFonds +

                nomFond

            );

        }


        const extensionFinale =
            String(

                extension ||

                this.extensionFondParDefaut

            )
                .trim()

                .replace(
                    /^\./,
                    ""
                );


        return (

            this.cheminFonds +

            nomFond +

            "." +

            extensionFinale

        );

    },


    /*=====================================================
        PRÉCHARGER UN FOND
    =====================================================*/

    prechargerFond(
        chemin
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (!chemin) {

                    reject(
                        new Error(
                            "Chemin de fond manquant."
                        )
                    );

                    return;

                }


                const image =
                    new Image();


                image.onload =
                    () => {

                        resolve(
                            chemin
                        );

                    };


                image.onerror =
                    () => {

                        reject(
                            new Error(
                                "Image de fond introuvable."
                            )
                        );

                    };


                image.src =
                    chemin;

            }
        );

    },
        /*=====================================================
        APPLIQUER UN FOND IMMÉDIATEMENT
    =====================================================*/

    appliquerFondImmediat(
        fond,
        options = {}
    ) {

        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (!elementFond) {

            return;

        }


        const nomFond =
            String(
                fond || ""
            ).trim();


        if (!nomFond) {

            return;

        }


        /*
            Annule une éventuelle ancienne transition
            avant d'appliquer immédiatement l'image.
        */

        this.annulerTransitionFond();


        const cheminFond =
            this.construireCheminFond(

                nomFond,

                options.extension

            );


        elementFond.style.backgroundImage =
            `url("${cheminFond}")`;


        this.appliquerOptionsFond(

            elementFond,

            options

        );


        elementFond.classList.remove(
            "changement-fond"
        );


        elementFond.classList.add(
            "fond-charge"
        );


        this.fondActuel =
            nomFond;


        this.changementFondEnCours =
            false;


        this.sauvegarder();

    },


    /*=====================================================
        APPLIQUER LES OPTIONS VISUELLES DU FOND
    =====================================================*/

    appliquerOptionsFond(
        elementFond,
        options = {}
    ) {

        if (!elementFond) {

            return;

        }


        /*
            Position de l'image.

            Exemples :

            "center"
            "top"
            "center top"
            "40% 20%"
        */

        elementFond.style.backgroundPosition =

            options.position ||

            "center";


        /*
            Taille de l'image.

            Exemples :

            "cover"
            "contain"
            "100% auto"
        */

        elementFond.style.backgroundSize =

            options.taille ||

            "cover";


        /*
            Répétition du fond.

            Exemple :

            "no-repeat"
            "repeat"
            "repeat-x"
        */

        elementFond.style.backgroundRepeat =

            options.repetition ||

            "no-repeat";


        /*
            Opacité du calque de fond.
        */

        const opacite =
            Number(
                options.opacite ?? 1
            );


        elementFond.style.opacity =
            String(

                Number.isFinite(
                    opacite
                )

                    ? Math.min(

                        1,

                        Math.max(
                            0,
                            opacite
                        )

                    )

                    : 1

            );


        /*
            Filtre CSS optionnel.

            Exemple JSON :

            "filtreFond":
                "brightness(0.8) blur(1px)"
        */

        elementFond.style.filter =

            options.filtre ||

            "none";

    },


    /*=====================================================
        RETIRER LE FOND
    =====================================================*/

    retirerFond(
        transition = null
    ) {

        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (!elementFond) {

            return;

        }


        this.annulerTransitionFond();


        const dureeTransition =
            Math.max(

                0,

                Number(

                    transition ??

                    this.dureeTransitionFondParDefaut

                )

            );


        /*
            Suppression immédiate du fond.
        */

        if (
            dureeTransition === 0
        ) {

            elementFond.style.backgroundImage =
                "none";


            elementFond.style.opacity =
                "1";


            elementFond.style.filter =
                "none";


            elementFond.classList.remove(
                "changement-fond"
            );


            elementFond.classList.remove(
                "fond-charge"
            );


            this.fondActuel =
                "";


            this.changementFondEnCours =
                false;


            this.sauvegarder();


            return;

        }


        /*
            Suppression progressive du fond.
        */

        this.changementFondEnCours =
            true;


        elementFond.classList.add(
            "changement-fond"
        );


        elementFond.classList.remove(
            "fond-charge"
        );


        this.timerFond =
            setTimeout(
                () => {

                    elementFond.style.backgroundImage =
                        "none";


                    elementFond.style.opacity =
                        "1";


                    elementFond.style.filter =
                        "none";


                    elementFond.classList.remove(
                        "changement-fond"
                    );


                    elementFond.classList.remove(
                        "fond-charge"
                    );


                    this.fondActuel =
                        "";


                    this.changementFondEnCours =
                        false;


                    this.timerFond =
                        null;


                    this.sauvegarder();

                },
                dureeTransition
            );

    },


    /*=====================================================
        ANNULER UNE TRANSITION DE FOND
    =====================================================*/

    annulerTransitionFond() {

        if (
            this.timerFond
        ) {

            clearTimeout(
                this.timerFond
            );


            this.timerFond =
                null;

        }


        this.changementFondEnCours =
            false;


        const elementFond =
            document.getElementById(
                "fond-jeu"
            );


        if (
            elementFond
        ) {

            elementFond.classList.remove(
                "changement-fond"
            );

        }

    },
        /*=====================================================
        FERMER ET VIDER LES CHOIX
    =====================================================*/

    fermerChoix() {

        if (
            typeof choixManager ===
            "undefined"
        ) {

            return;

        }


        if (
            typeof choixManager
                .fermerPopup ===
                "function"
        ) {

            choixManager.fermerPopup();

        }


        if (
            typeof choixManager
                .vider ===
                "function"
        ) {

            choixManager.vider();

        }

    },


    /*=====================================================
        AFFICHER LE BOUTON DES CHOIX
    =====================================================*/

    afficherBoutonChoix(
        choixDisponibles
    ) {

        this.supprimerBoutonChoix();


        if (
            !Array.isArray(
                choixDisponibles
            ) ||
            choixDisponibles.length === 0
        ) {

            return;

        }


        const conteneur =
            document.getElementById(
                "texte"
            );


        if (!conteneur) {

            console.error(
                "Impossible d'afficher le bouton des choix : #texte est introuvable."
            );

            return;

        }


        const zoneBouton =
            document.createElement(
                "div"
            );


        zoneBouton.className =
            "zone-afficher-choix";


        const bouton =
            document.createElement(
                "button"
            );


        bouton.type =
            "button";


        bouton.className =
            "bouton-afficher-choix";


        bouton.textContent =
            "Afficher les choix";


        bouton.setAttribute(
            "aria-label",
            "Afficher les choix disponibles"
        );


        bouton.addEventListener(
            "click",
            () => {

                this.supprimerBoutonChoix();


                if (
                    typeof choixManager !==
                        "undefined" &&
                    typeof choixManager
                        .afficher ===
                        "function"
                ) {

                    choixManager.afficher(
                        choixDisponibles
                    );

                }
                else {

                    console.error(
                        "choixManager.afficher est introuvable."
                    );

                }

            },
            {
                once: true
            }
        );


        zoneBouton.appendChild(
            bouton
        );


        conteneur.appendChild(
            zoneBouton
        );


        this.boutonChoix =
            zoneBouton;


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .defiler ===
                "function"
        ) {

            dialogueManager.defiler();

        }

    },


    /*=====================================================
        SUPPRIMER LE BOUTON DES CHOIX
    =====================================================*/

    supprimerBoutonChoix() {

        if (
            this.boutonChoix &&
            this.boutonChoix.parentNode
        ) {

            this.boutonChoix.remove();

        }


        this.boutonChoix =
            null;


        /*
            Sécurité supplémentaire :
            supprime d'anciens boutons restés
            dans la page après un changement
            rapide de scène.
        */

        document
            .querySelectorAll(
                ".zone-afficher-choix"
            )
            .forEach(
                element => {

                    element.remove();

                }
            );

    },


    /*=====================================================
        ANNULER L'ATTENTE DES CHOIX
    =====================================================*/

    annulerAttenteChoix() {

        if (
            this.timerChoix
        ) {

            clearTimeout(
                this.timerChoix
            );


            this.timerChoix =
                null;

        }


        this.supprimerBoutonChoix();

    },


    /*=====================================================
        TRAITER UN CHOIX
    =====================================================*/

    traiterChoix(
        choix
    ) {

        if (!choix) {

            return;

        }


        this.annulerAttenteChoix();

        this.fermerChoix();


        /*-----------------------------------------------
            CHOIX VERROUILLÉ
        -----------------------------------------------*/

        if (
            choix.verrouille
        ) {

            if (
                typeof dialogueManager !==
                    "undefined" &&
                typeof dialogueManager
                    .notification ===
                    "function"
            ) {

                dialogueManager.notification(

                    choix.messageVerrouille ||

                    "Ce choix n'est pas disponible."

                );

            }

            return;

        }


        /*-----------------------------------------------
            MESSAGE DU JOUEUR
        -----------------------------------------------*/

        let messageAffiche =

            choix.message?.texte ||

            choix.texte ||

            "";


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .remplacerVariables ===
                "function"
        ) {

            messageAffiche =
                dialogueManager
                    .remplacerVariables(
                        messageAffiche
                    );

        }


        const personnage =

            choix.message?.personnage ||

            "joueur";


        /*
            Permet à un message de choix
            de modifier le fond du jeu.
        */

        if (
            choix.message &&
            typeof this.gererFondDialogue ===
                "function"
        ) {

            this.gererFondDialogue(
                choix.message
            );

        }


        if (
            messageAffiche &&
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .ajouterMessage ===
                "function"
        ) {

            dialogueManager.ajouterMessage(

                messageAffiche,

                personnage,

                {

                    ...(choix.message || {}),

                    son:

                        choix.message?.son ||

                        choix.son,

                    volumeSon:

                        choix.message?.volumeSon ??

                        choix.volumeSon,

                    evenement:

                        choix.message?.evenement ||

                        choix.evenement,

                    forcerSon:

                        choix.message?.forcerSon ??

                        choix.forcerSon

                }

            );

        }
        else if (
            choix.son &&
            typeof audioManager !==
                "undefined" &&
            typeof audioManager
                .jouerSon ===
                "function"
        ) {

            audioManager.jouerSon(

                choix.son,

                choix.volumeSon

            );

        }


        /*-----------------------------------------------
            CHOIX IMPORTANT
        -----------------------------------------------*/

        if (
            choix.important === true &&
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .choixImportant ===
                "function"
        ) {

            dialogueManager.choixImportant(

                choix.notificationImportante ||

                ""

            );

        }


        /*-----------------------------------------------
            APPLICATION DES EFFETS
        -----------------------------------------------*/

        if (
            typeof conditionsManager !==
                "undefined"
        ) {

            if (
                typeof conditionsManager
                    .appliquerEffet ===
                    "function"
            ) {

                conditionsManager.appliquerEffet(

                    choix.effet,

                    this.joueur

                );

            }


            if (
                typeof conditionsManager
                    .appliquerEffets ===
                    "function"
            ) {

                conditionsManager.appliquerEffets(

                    choix.effets,

                    this.joueur

                );

            }

        }
        else {

            this.appliquerEffetsSimples(
                choix.effet
            );


            this.appliquerEffetsSimples(
                choix.effets
            );

        }


        /*-----------------------------------------------
            RECHERCHE DE LA DESTINATION
        -----------------------------------------------*/

        let destination =
            choix.next || null;


        if (
            typeof conditionsManager !==
                "undefined" &&
            typeof conditionsManager
                .resoudreDestination ===
                "function"
        ) {

            destination =
                conditionsManager
                    .resoudreDestination(

                        choix,

                        this.joueur

                    );

        }


        this.sauvegarder();


        /*-----------------------------------------------
            PASSAGE À LA SCÈNE SUIVANTE
        -----------------------------------------------*/

        const delai =
            Math.max(

                0,

                Number(
                    choix.delai ?? 800
                )

            );


        this.timerChoix =
            setTimeout(
                () => {

                    this.timerChoix =
                        null;


                    this.gererDestination(
                        destination
                    );

                },
                delai
            );

    },


    /*=====================================================
        APPLIQUER DES EFFETS SIMPLES
    =====================================================*/

    appliquerEffetsSimples(
        effets
    ) {

        if (
            !effets ||
            typeof effets !==
                "object" ||
            !this.joueur
        ) {

            return;

        }


        Object.entries(
            effets
        ).forEach(
            ([cle, valeur]) => {

                if (
                    typeof valeur ===
                    "number"
                ) {

                    const valeurActuelle =
                        Number(
                            this.joueur[
                                cle
                            ]
                        );


                    this.joueur[
                        cle
                    ] =

                        (
                            Number.isFinite(
                                valeurActuelle
                            )

                                ? valeurActuelle

                                : 0

                        ) + valeur;

                }
                else {

                    this.joueur[
                        cle
                    ] =
                        valeur;

                }

            }
        );

    },
        /*=====================================================
        GÉRER UNE DESTINATION
    =====================================================*/

    gererDestination(
        destination
    ) {

        if (!destination) {

            console.warn(
                "Destination manquante."
            );

            return;

        }


        const destinationTexte =
            String(
                destination
            ).trim();


        if (!destinationTexte) {

            console.warn(
                "Destination vide."
            );

            return;

        }


        /*-----------------------------------------------
            FIN DU JEU
        -----------------------------------------------*/

        if (
            destinationTexte ===
                "finJeu" ||
            destinationTexte ===
                "terminerJeu"
        ) {

            this.terminerJeu();

            return;

        }


        /*
            Permet d’indiquer directement
            le nom d’une fin dans le JSON.

            Exemple :

            "next": "fin:finEva"
        */

        if (
            destinationTexte.startsWith(
                "fin:"
            )
        ) {

            const nomFin =
                destinationTexte.substring(
                    4
                ) ||
                "finNeutre";


            this.terminerJeu(
                nomFin
            );

            return;

        }


        /*-----------------------------------------------
            CHANGEMENT DE CHAPITRE
        -----------------------------------------------*/

        if (
            /^chapitre\d+$/i.test(
                destinationTexte
            )
        ) {

            const numero =
                Number.parseInt(

                    destinationTexte.replace(
                        /chapitre/i,
                        ""
                    ),

                    10

                );


            if (
                Number.isNaN(
                    numero
                ) ||
                numero < 1
            ) {

                this.afficherErreur(

                    "Destination invalide : " +

                    destinationTexte

                );

                return;

            }


            /*
                Dans les fichiers JSON :

                chapitre1 = index 0
                chapitre2 = index 1
                chapitre3 = index 2
            */

            this.changerChapitre(
                numero - 1
            );

            return;

        }


        /*-----------------------------------------------
            CHANGEMENT DE SCÈNE
        -----------------------------------------------*/

        this.chargerScene(
            destinationTexte
        );

    },


    /*=====================================================
        CHANGER DE CHAPITRE
    =====================================================*/

    changerChapitre(
        numero
    ) {

        /*
            Empêche un double clic de lancer
            deux changements de chapitre.
        */

        if (
            this.transitionChapitreEnCours
        ) {

            return;

        }


        const numeroChapitre =
            Number(
                numero
            );


        if (
            !Number.isInteger(
                numeroChapitre
            ) ||
            numeroChapitre < 0
        ) {

            this.afficherErreur(
                "Numéro de chapitre invalide."
            );

            return;

        }


        const chapitre =
            chapitresManager.obtenir(
                numeroChapitre
            );


        if (!chapitre) {

            this.afficherErreur(

                "Chapitre introuvable : " +

                (numeroChapitre + 1)

            );

            return;

        }


        this.transitionChapitreEnCours =
            true;


        this.annulerAttenteChoix();

        this.annulerTransitionFond();

        this.fermerChoix();


        this.chapitreActuel =
            numeroChapitre;


        this.sceneActuelle =
            chapitre.debut;


        this.sauvegarder();


        /*
            Vide les anciens dialogues.
        */

        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .vider ===
                "function"
        ) {

            dialogueManager.vider();

        }


        /*
            Fonction lancée lorsque l’écran
            est devenu noir.
        */

        const chargerNouveauChapitre =
            () => {

                this.chargerChapitre(
                    numeroChapitre
                );


                this.transitionChapitreEnCours =
                    false;


                /*
                    Fait disparaître l’écran noir
                    après le chargement du chapitre.
                */

                if (
                    typeof animationManager !==
                        "undefined" &&
                    typeof animationManager
                        .sortirDuNoir ===
                        "function"
                ) {

                    setTimeout(
                        () => {

                            animationManager
                                .sortirDuNoir();

                        },
                        150
                    );

                }

            };


        /*
            Transition vers le noir si le
            gestionnaire d’animations existe.
        */

        if (
            typeof animationManager !==
                "undefined" &&
            typeof animationManager
                .transitionVersNoir ===
                "function"
        ) {

            animationManager
                .transitionVersNoir(
                    chargerNouveauChapitre
                );

            return;

        }


        /*
            Chargement direct si aucun gestionnaire
            d’animations n’est disponible.
        */

        chargerNouveauChapitre();

    },
        /*=====================================================
        GÉRER L'AUDIO D'UNE SCÈNE
    =====================================================*/

    gererAudioScene(
        scene
    ) {

        if (
            !scene ||
            typeof audioManager ===
                "undefined"
        ) {

            return;

        }


        /*-----------------------------------------------
            MUSIQUE DE LA SCÈNE
        -----------------------------------------------*/

        const arreterMusique =

            scene.arreterMusique === true ||

            scene.musique === null ||

            scene.musique === "aucun" ||

            scene.musique === "aucune";


        if (
            arreterMusique
        ) {

            if (
                typeof audioManager
                    .arreterMusique ===
                    "function"
            ) {

                audioManager
                    .arreterMusique();

            }

        }
        else if (
            scene.musique
        ) {

            const transitionMusique =
                Math.max(

                    0,

                    Number(
                        scene.transitionMusique ??
                        800
                    )

                );


            /*
                Lecture directe sans fondu.
            */

            if (
                scene.fonduMusique === false &&
                typeof audioManager
                    .jouerMusique ===
                    "function"
            ) {

                audioManager.jouerMusique(

                    scene.musique,

                    scene.volumeMusique

                );

            }

            /*
                Changement avec fondu.
            */

            else if (
                typeof audioManager
                    .changerMusique ===
                    "function"
            ) {

                audioManager.changerMusique(

                    scene.musique,

                    transitionMusique,

                    scene.volumeMusique

                );

            }

            /*
                Solution de secours.
            */

            else if (
                typeof audioManager
                    .jouerMusique ===
                    "function"
            ) {

                audioManager.jouerMusique(

                    scene.musique,

                    scene.volumeMusique

                );

            }

        }


        /*-----------------------------------------------
            AMBIANCE DE LA SCÈNE
        -----------------------------------------------*/

        const arreterAmbiance =

            scene.arreterAmbiance === true ||

            scene.ambiance === null ||

            scene.ambiance === "aucun" ||

            scene.ambiance === "aucune";


        if (
            arreterAmbiance
        ) {

            const transitionAmbiance =
                Math.max(

                    0,

                    Number(
                        scene.transitionAmbiance ??
                        0
                    )

                );


            if (
                transitionAmbiance > 0 &&
                typeof audioManager
                    .fadeOutAmbiance ===
                    "function"
            ) {

                audioManager.fadeOutAmbiance(
                    transitionAmbiance
                );

            }
            else if (
                typeof audioManager
                    .arreterAmbiance ===
                    "function"
            ) {

                audioManager
                    .arreterAmbiance();

            }

        }
        else if (
            scene.ambiance
        ) {

            const transitionAmbiance =
                Math.max(

                    0,

                    Number(
                        scene.transitionAmbiance ??
                        600
                    )

                );


            /*
                Lecture directe sans fondu.
            */

            if (
                scene.fonduAmbiance === false &&
                typeof audioManager
                    .jouerAmbiance ===
                    "function"
            ) {

                audioManager.jouerAmbiance(

                    scene.ambiance,

                    scene.volumeAmbiance

                );

            }

            /*
                Changement avec fondu.
            */

            else if (
                typeof audioManager
                    .changerAmbiance ===
                    "function"
            ) {

                audioManager.changerAmbiance(

                    scene.ambiance,

                    transitionAmbiance,

                    scene.volumeAmbiance

                );

            }

            /*
                Solution de secours.
            */

            else if (
                typeof audioManager
                    .jouerAmbiance ===
                    "function"
            ) {

                audioManager.jouerAmbiance(

                    scene.ambiance,

                    scene.volumeAmbiance

                );

            }

        }


        /*-----------------------------------------------
            EFFET SONORE AU CHARGEMENT
        -----------------------------------------------*/

        if (
            scene.son &&
            scene.son !== "aucun" &&
            scene.son !== "aucune" &&
            typeof audioManager
                .jouerSon ===
                "function"
        ) {

            audioManager.jouerSon(

                scene.son,

                scene.volumeSon

            );

        }

    },
        /*=====================================================
        TERMINER LE JEU
    =====================================================*/

    terminerJeu(
        nomFin = "finNeutre"
    ) {

        this.annulerAttenteChoix();

        this.annulerTransitionFond();

        this.fermerChoix();


        /*
            Enregistre la fin atteinte avant
            d'afficher l'écran final.
        */

        if (
            !this.joueur.finsDebloquees
        ) {

            this.joueur.finsDebloquees =
                [];

        }


        if (
            !this.joueur
                .finsDebloquees
                .includes(
                    nomFin
                )
        ) {

            this.joueur
                .finsDebloquees
                .push(
                    nomFin
                );

        }


        this.joueur.jeuTermine =
            true;


        this.joueur.derniereFin =
            nomFin;


        this.sauvegarder();


        /*
            Arrête progressivement l'audio.
        */

        if (
            typeof audioManager !==
                "undefined"
        ) {

            if (
                typeof audioManager
                    .fadeOut ===
                    "function"
            ) {

                audioManager.fadeOut(
                    1200
                );

            }
            else if (
                typeof audioManager
                    .arreterMusique ===
                    "function"
            ) {

                audioManager
                    .arreterMusique();

            }


            if (
                typeof audioManager
                    .fadeOutAmbiance ===
                    "function"
            ) {

                audioManager.fadeOutAmbiance(
                    1000
                );

            }
            else if (
                typeof audioManager
                    .arreterAmbiance ===
                    "function"
            ) {

                audioManager
                    .arreterAmbiance();

            }

        }


        /*
            Retire le fond avec un fondu.
        */

        this.retirerFond(
            800
        );


        /*
            Vide l'interface.
        */

        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .vider ===
                "function"
        ) {

            dialogueManager.vider();

        }


        /*
            Écran de fin personnalisé si
            animationManager le permet.
        */

        if (
            typeof animationManager !==
                "undefined" &&
            typeof animationManager
                .afficherFin ===
                "function"
        ) {

            animationManager.afficherFin(
                nomFin
            );

            return;

        }


        /*
            Solution de secours :
            crée directement un écran de fin.
        */

        this.afficherEcranFin(
            nomFin
        );

    },


    /*=====================================================
        AFFICHER L'ÉCRAN DE FIN
    =====================================================*/

    afficherEcranFin(
        nomFin
    ) {

        const conteneur =
            document.getElementById(
                "texte"
            );


        if (!conteneur) {

            console.error(
                "Impossible d'afficher la fin : #texte est introuvable."
            );

            return;

        }


        conteneur.innerHTML =
            "";


        const ecranFin =
            document.createElement(
                "section"
            );


        ecranFin.className =
            "ecran-fin";


        const titreFin =
            document.createElement(
                "h2"
            );


        titreFin.className =
            "titre-fin";


        titreFin.textContent =
            "Fin";


        const texteFin =
            document.createElement(
                "p"
            );


        texteFin.className =
            "texte-fin";


        texteFin.textContent =
            this.obtenirTexteFin(
                nomFin
            );


        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "actions-fin";


        const boutonRecommencer =
            document.createElement(
                "button"
            );


        boutonRecommencer.type =
            "button";


        boutonRecommencer.className =
            "bouton-fin bouton-recommencer";


        boutonRecommencer.textContent =
            "Recommencer";


        boutonRecommencer.addEventListener(
            "click",
            () => {

                this.nouvellePartie();

            }
        );


        const boutonMenu =
            document.createElement(
                "button"
            );


        boutonMenu.type =
            "button";


        boutonMenu.className =
            "bouton-fin bouton-menu";


        boutonMenu.textContent =
            "Retour au menu";


        boutonMenu.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


        actions.appendChild(
            boutonRecommencer
        );


        actions.appendChild(
            boutonMenu
        );


        ecranFin.appendChild(
            titreFin
        );


        ecranFin.appendChild(
            texteFin
        );


        ecranFin.appendChild(
            actions
        );


        conteneur.appendChild(
            ecranFin
        );

    },
        /*=====================================================
        OBTENIR LE TEXTE D'UNE FIN
    =====================================================*/

    obtenirTexteFin(
        nomFin
    ) {

        const textesFins = {

            finEva:
                "Votre histoire avec Eva arrive à son terme.",

            finEmelyne:
                "Votre relation avec Émelyne a changé votre parcours.",

            finZoe:
                "Zoé restera une personne importante de cette histoire.",

            finSolitaire:
                "Vous terminez cette histoire en suivant votre propre chemin.",

            finNeutre:
                "Cette histoire est terminée, mais d'autres choix restent à découvrir."

        };


        return (

            textesFins[
                nomFin
            ] ||

            textesFins.finNeutre

        );

    },


    /*=====================================================
        AFFICHER UNE ERREUR
    =====================================================*/

    afficherErreur(
        message
    ) {

        const messageErreur =
            String(

                message ||

                "Une erreur inconnue est survenue."

            );


        console.error(
            messageErreur
        );


        this.annulerAttenteChoix();

        this.fermerChoix();


        const conteneur =
            document.getElementById(
                "texte"
            );


        if (!conteneur) {

            alert(
                messageErreur
            );

            return;

        }


        const blocErreur =
            document.createElement(
                "div"
            );


        blocErreur.className =
            "message-erreur-jeu";


        const titreErreur =
            document.createElement(
                "strong"
            );


        titreErreur.textContent =
            "Erreur";


        const texteErreur =
            document.createElement(
                "p"
            );


        texteErreur.textContent =
            messageErreur;


        const boutonMenu =
            document.createElement(
                "button"
            );


        boutonMenu.type =
            "button";


        boutonMenu.className =
            "bouton-erreur-menu";


        boutonMenu.textContent =
            "Retour au menu";


        boutonMenu.addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


        blocErreur.appendChild(
            titreErreur
        );


        blocErreur.appendChild(
            texteErreur
        );


        blocErreur.appendChild(
            boutonMenu
        );


        conteneur.appendChild(
            blocErreur
        );


        if (
            typeof dialogueManager !==
                "undefined" &&
            typeof dialogueManager
                .defiler ===
                "function"
        ) {

            dialogueManager.defiler();

        }

    }

};


/*=========================================================
    DÉMARRAGE DU MOTEUR
=========================================================*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
            Vérifie que les éléments HTML principaux
            existent avant de démarrer le jeu.
        */

        const titre =
            document.getElementById(
                "titre"
            );


        const texte =
            document.getElementById(
                "texte"
            );


        const fond =
            document.getElementById(
                "fond-jeu"
            );


        if (!titre) {

            console.error(
                "L'élément HTML #titre est introuvable."
            );

        }


        if (!texte) {

            console.error(
                "L'élément HTML #texte est introuvable."
            );

        }


        if (!fond) {

            console.error(
                "L'élément HTML #fond-jeu est introuvable."
            );

        }


        if (
            !titre ||
            !texte ||
            !fond
        ) {

            return;

        }


        /*
            Initialise les gestionnaires externes
            lorsqu'ils possèdent une méthode
            d'initialisation.
        */

        const gestionnaires = [

            typeof audioManager !==
                "undefined"

                ? audioManager

                : null,


            typeof dialogueManager !==
                "undefined"

                ? dialogueManager

                : null,


            typeof choixManager !==
                "undefined"

                ? choixManager

                : null,


            typeof animationManager !==
                "undefined"

                ? animationManager

                : null

        ];


        gestionnaires.forEach(
            gestionnaire => {

                if (
                    gestionnaire &&
                    typeof gestionnaire
                        .initialiser ===
                        "function"
                ) {

                    gestionnaire.initialiser();

                }

            }
        );


        /*
            Démarrage du jeu.
        */

        if (
            typeof moteur.initialiser ===
                "function"
        ) {

            moteur.initialiser();

        }
        else {

            console.error(
                "La fonction moteur.initialiser est introuvable."
            );

        }

    }
);
