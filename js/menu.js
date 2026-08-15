"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    menu.js
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*=================================================
            ÉLÉMENTS DU MENU
        =================================================*/

        const transition =
            document.getElementById(
                "transition"
            );

        const boutonNouvellePartie =
            document.getElementById(
                "nouvellePartie"
            );

        const boutonContinuer =
            document.getElementById(
                "continuer"
            );

        const boutonCharger =
            document.getElementById(
                "charger"
            );

        const boutonGalerie =
            document.getElementById(
                "galerie"
            );

        const boutonSucces =
            document.getElementById(
                "succes"
            );

        const boutonParametres =
            document.getElementById(
                "parametres"
            );

        const boutonCredits =
            document.getElementById(
                "credits"
            );

        const boutonQuitter =
            document.getElementById(
                "quitter"
            );

        let transitionEnCours =
            false;

        /*=================================================
            CLÉS DE SAUVEGARDE
        =================================================*/

        const CLE_NOUVELLE_PARTIE =
            "nouvellePartieDemandee";

        /*
            Plusieurs anciennes clés sont conservées
            afin de rester compatible avec les
            versions précédentes du jeu.
        */

        const CLES_SAUVEGARDE_POSSIBLES = [

            "save",

            "sauvegarde",

            "friendzoneRebornSave",

            "friendzoneRebornSauvegarde",

            "friendzone_reborn_save"

        ];

        /*=================================================
            VÉRIFIER UNE SAUVEGARDE
        =================================================*/

        function sauvegardeExiste() {

            return CLES_SAUVEGARDE_POSSIBLES.some(
                cle => {

                    const valeur =
                        localStorage.getItem(
                            cle
                        );

                    return (
                        valeur !== null &&
                        valeur.trim() !== ""
                    );

                }
            );

        }

        /*=================================================
            ACTUALISER LES BOUTONS
        =================================================*/

        function actualiserBoutonsSauvegarde() {

            const existe =
                sauvegardeExiste();

            if (boutonContinuer) {

                boutonContinuer.style.display =
                    existe
                        ? ""
                        : "none";

                boutonContinuer.disabled =
                    !existe;

            }

            if (boutonCharger) {

                boutonCharger.style.display =
                    existe
                        ? ""
                        : "none";

                boutonCharger.disabled =
                    !existe;

            }

        }

        /*=================================================
            VÉRIFIER AUDIO MANAGER
        =================================================*/

        function audioManagerDisponible() {

            return (
                typeof audioManager !== "undefined" &&
                audioManager !== null
            );

        }

        /*=================================================
            INITIALISER LA MUSIQUE DU MENU
        =================================================*/

        function initialiserMusique() {

            if (!audioManagerDisponible()) {

                console.warn(
                    "menu.js : audioManager est introuvable."
                );

                return;

            }

            audioManager.jouerMusique(
                "menu"
            );

        }

        /*=================================================
            DÉMARRER APRÈS UNE INTERACTION
        =================================================*/

        function demarrerMusiqueApresInteraction() {

            if (!audioManagerDisponible()) {

                return;

            }

            /*
                Si aucune musique n'est chargée,
                on demande le lancement de menu.mp3.
            */

            if (
                audioManager.musiqueActuelle !==
                "menu"
            ) {

                audioManager.jouerMusique(
                    "menu"
                );

                return;

            }

            /*
                Si la musique avait été bloquée par
                le navigateur, on tente de la reprendre.
            */

            if (
                audioManager.musique &&
                audioManager.musique.paused
            ) {

                audioManager.musique
                    .play()
                    .catch(
                        erreur => {

                            console.warn(
                                "Impossible de lancer la musique du menu :",
                                erreur
                            );

                        }
                    );

            }

        }

        /*
            Le premier clic permet de débloquer
            l'audio dans les navigateurs modernes.
        */

        document.addEventListener(
            "click",
            demarrerMusiqueApresInteraction,
            {
                once: true
            }
        );

                /*=================================================
            FONDU DE LA MUSIQUE
        =================================================*/

        function fadeOutMusique(
            duree = 1200
        ) {

            if (!audioManagerDisponible()) {

                return;

            }

            if (
                typeof audioManager.fadeOut !==
                "function"
            ) {

                audioManager.arreterMusique();

                return;

            }

            audioManager.fadeOut(
                duree
            );

        }

        /*=================================================
            LANCER LE JEU
        =================================================*/

        function lancerJeu() {

            if (transitionEnCours) {

                return;

            }

            transitionEnCours =
                true;

            /*
                Empêche les doubles clics pendant
                la transition vers le jeu.
            */

            document
                .querySelectorAll(
                    "button"
                )
                .forEach(
                    bouton => {

                        bouton.disabled =
                            true;

                    }
                );

            fadeOutMusique(
                1200
            );

            if (transition) {

                transition.classList.add(
                    "actif"
                );

            }

            setTimeout(
                () => {

                    window.location.href =
                        "jeu.html";

                },
                1200
            );

        }

        /*=================================================
            NOUVELLE PARTIE
        =================================================*/

        function demanderNouvellePartie() {

            /*
                Si aucune sauvegarde n'existe,
                aucune confirmation n'est nécessaire.
            */

            if (sauvegardeExiste()) {

                const confirmation =
                    window.confirm(
                        "Commencer une nouvelle partie ? La progression actuelle sera remplacée."
                    );

                if (!confirmation) {

                    return;

                }

            }

            /*
                Cette clé indique à moteur.js
                qu'une nouvelle partie a été demandée.
            */

            localStorage.setItem(
                CLE_NOUVELLE_PARTIE,
                "true"
            );

            lancerJeu();

        }

        /*=================================================
            CONTINUER LA PARTIE
        =================================================*/

        function continuerPartie() {

            if (!sauvegardeExiste()) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );

                actualiserBoutonsSauvegarde();

                return;

            }

            /*
                On retire la demande de nouvelle partie
                afin que moteur.js charge la sauvegarde.
            */

            localStorage.removeItem(
                CLE_NOUVELLE_PARTIE
            );

            lancerJeu();

        }

        /*=================================================
            CHARGER UNE SAUVEGARDE
        =================================================*/

        function chargerSauvegarde() {

            if (!sauvegardeExiste()) {

                window.alert(
                    "Aucune sauvegarde n'est disponible."
                );

                actualiserBoutonsSauvegarde();

                return;

            }

            window.alert(
                "Le système de plusieurs sauvegardes sera disponible prochainement."
            );

        }

        /*=================================================
            OUVRIR UNE POPUP
        =================================================*/

        function ouvrirPopup(id) {

            const popup =
                document.getElementById(
                    id
                );

            if (!popup) {

                console.warn(
                    `menu.js : popup introuvable : ${id}`
                );

                return;

            }

            popup.style.display =
                "flex";

            popup.classList.add(
                "ouverte"
            );

            popup.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        /*=================================================
            FERMER UNE POPUP
        =================================================*/

        function fermerPopup(popup) {

            if (!popup) {

                return;

            }

            popup.classList.remove(
                "ouverte"
            );

            popup.setAttribute(
                "aria-hidden",
                "true"
            );

            /*
                Attend la fin éventuelle de l'animation CSS.
            */

            setTimeout(
                () => {

                    if (
                        !popup.classList.contains(
                            "ouverte"
                        )
                    ) {

                        popup.style.display =
                            "none";

                    }

                },
                200
            );

        }

                /*=================================================
            FERMER TOUTES LES POPUPS
        =================================================*/

        function fermerToutesLesPopups() {

            document
                .querySelectorAll(
                    ".popup"
                )
                .forEach(
                    popup => {

                        fermerPopup(
                            popup
                        );

                    }
                );

        }

        /*
            Permet aux boutons HTML d'utiliser :

            onclick="fermerPopup()"
        */

        window.fermerPopup =
            fermerToutesLesPopups;

        /*
            Fermer une popup en cliquant
            sur son arrière-plan.
        */

        document
            .querySelectorAll(
                ".popup"
            )
            .forEach(
                popup => {

                    popup.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                popup
                            ) {

                                fermerPopup(
                                    popup
                                );

                            }

                        }
                    );

                }
            );

        /*
            Fermer les popups avec Échap.
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    fermerToutesLesPopups();

                }

            }
        );

        /*=================================================
            BOUTON NOUVELLE PARTIE
        =================================================*/

        if (boutonNouvellePartie) {

            boutonNouvellePartie.addEventListener(
                "click",
                demanderNouvellePartie
            );

        }
        else {

            console.warn(
                "menu.js : bouton #nouvellePartie introuvable."
            );

        }

        /*=================================================
            BOUTON CONTINUER
        =================================================*/

        if (boutonContinuer) {

            boutonContinuer.addEventListener(
                "click",
                continuerPartie
            );

        }

        /*=================================================
            BOUTON CHARGER
        =================================================*/

        if (boutonCharger) {

            boutonCharger.addEventListener(
                "click",
                chargerSauvegarde
            );

        }

        /*=================================================
            BOUTON GALERIE
        =================================================*/

        if (boutonGalerie) {

            boutonGalerie.addEventListener(
                "click",
                () => {

                    ouvrirPopup(
                        "fenetreGalerie"
                    );

                }
            );

        }

        /*=================================================
            BOUTON SUCCÈS
        =================================================*/

        if (boutonSucces) {

            boutonSucces.addEventListener(
                "click",
                () => {

                    ouvrirPopup(
                        "fenetreSucces"
                    );

                }
            );

        }

        /*=================================================
            BOUTON PARAMÈTRES
        =================================================*/

        if (boutonParametres) {

            boutonParametres.addEventListener(
                "click",
                () => {

                    ouvrirPopup(
                        "fenetreParametres"
                    );

                }
            );

        }

        /*=================================================
            BOUTON CRÉDITS
        =================================================*/

        if (boutonCredits) {

            boutonCredits.addEventListener(
                "click",
                () => {

                    ouvrirPopup(
                        "fenetreCredits"
                    );

                }
            );

        }

                /*=================================================
            BOUTON QUITTER
        =================================================*/

        if (boutonQuitter) {

            boutonQuitter.addEventListener(
                "click",
                () => {

                    const confirmation =
                        window.confirm(
                            "Quitter le jeu ?"
                        );

                    if (!confirmation) {

                        return;

                    }

                    /*
                        Arrête la musique avant
                        la tentative de fermeture.
                    */

                    if (
                        audioManagerDisponible() &&
                        typeof audioManager.arreterMusique ===
                            "function"
                    ) {

                        audioManager.arreterMusique();

                    }

                    /*
                        window.close() fonctionne uniquement
                        si la fenêtre a été ouverte par JavaScript.
                    */

                    window.close();

                    setTimeout(
                        () => {

                            if (!window.closed) {

                                window.alert(
                                    "Le navigateur empêche la fermeture automatique. Tu peux fermer cet onglet manuellement."
                                );

                            }

                        },
                        150
                    );

                }
            );

        }

        /*=================================================
            MISE À JOUR DEPUIS UN AUTRE ONGLET
        =================================================*/

        window.addEventListener(
            "storage",
            event => {

                if (
                    CLES_SAUVEGARDE_POSSIBLES.includes(
                        event.key
                    )
                ) {

                    actualiserBoutonsSauvegarde();

                }

            }
        );

        /*=================================================
            RETOUR SUR LA PAGE
        =================================================*/

        window.addEventListener(
            "pageshow",
            () => {

                transitionEnCours =
                    false;

                actualiserBoutonsSauvegarde();

                document
                    .querySelectorAll(
                        "button"
                    )
                    .forEach(
                        bouton => {

                            bouton.disabled =
                                false;

                        }
                    );

                if (transition) {

                    transition.classList.remove(
                        "actif"
                    );

                }

            }
        );

        /*=================================================
            INITIALISATION
        =================================================*/

        actualiserBoutonsSauvegarde();

        initialiserMusique();

    }
);
