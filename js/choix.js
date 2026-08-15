"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    choix.js
=========================================================*/

const choixManager = {

    conteneur: null,
    popup: null,
    verrouille: false,


    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.conteneur =
            document.getElementById("choix");

        this.popup =
            document.getElementById("popupChoix");


        if (!this.conteneur) {

            console.error(
                "choix.js : l'élément #choix est introuvable."
            );

        }


        if (!this.popup) {

            console.error(
                "choix.js : l'élément #popupChoix est introuvable."
            );

        }

    },


    /*=====================================================
        AFFICHER LES CHOIX
    =====================================================*/

    afficher(listeChoix) {

        if (
            !this.conteneur ||
            !this.popup
        ) {

            this.initialiser();

        }


        if (!this.conteneur) {

            return;

        }


        this.vider();


        if (
            !Array.isArray(listeChoix) ||
            listeChoix.length === 0
        ) {

            this.fermerPopup();

            return;

        }


        listeChoix.forEach(
            (choix, index) => {

                this.creerBouton(
                    choix,
                    index
                );

            }
        );


        this.ouvrirPopup();

    },


    /*=====================================================
        CRÉER UN BOUTON
    =====================================================*/

    creerBouton(
        choix,
        index
    ) {

        if (!choix) {

            return;

        }


        const bouton =
            document.createElement("button");


        bouton.type = "button";

        bouton.classList.add("choix");

        bouton.textContent =
            choix.texte ||
            "Continuer";


        /*
            Classe visuelle facultative :

            "classe": "romance"
            "classe": "danger"
            "classe": "important"
        */

        if (choix.classe) {

            bouton.classList.add(
                choix.classe
            );

        }


        /*
            Choix verrouillé
        */

        if (choix.verrouille) {

            bouton.classList.add(
                "locked"
            );

            bouton.setAttribute(
                "aria-disabled",
                "true"
            );

        }


        /*
            Animation d'apparition
        */

        bouton.style.animationDelay =
            `${index * 100}ms`;


        /*
            Clic
        */

        bouton.addEventListener(
            "click",
            () => {

                this.gererClic(
                    choix,
                    bouton
                );

            }
        );


        this.conteneur.appendChild(
            bouton
        );

    },


    /*=====================================================
        GÉRER LE CLIC
    =====================================================*/

    gererClic(
        choix,
        bouton
    ) {

        /*
            Empêche plusieurs clics rapides
        */

        if (this.verrouille) {

            return;

        }


        /*
            Choix verrouillé
        */

        if (choix.verrouille) {

            if (
                typeof dialogueManager !==
                "undefined"
            ) {

                dialogueManager.notification(

                    choix.messageVerrouille ||

                    "Ce choix n'est pas encore disponible."

                );

            }

            return;

        }


        this.verrouille = true;


        this.selectionner(
            bouton
        );


        /*
            Son de clic
        */

        if (
            typeof audioManager !==
            "undefined"
        ) {

            audioManager.jouerSon(

                choix.sonClic ||
                "click",

                choix.volumeClic ??
                0.4

            );

        }


        /*
            Traitement par le moteur
        */

        if (
            typeof moteur !==
            "undefined" &&

            typeof moteur.traiterChoix ===
            "function"
        ) {

            moteur.traiterChoix(
                choix
            );

        }
        else {

            console.error(
                "choix.js : moteur.traiterChoix() est introuvable."
            );

            this.verrouille = false;

        }

    },


    /*=====================================================
        SÉLECTIONNER UN CHOIX
    =====================================================*/

    selectionner(
        boutonSelectionne
    ) {

        if (!this.conteneur) {

            return;

        }


        const boutons =

            this.conteneur
                .querySelectorAll(
                    "button"
                );


        boutons.forEach(
            bouton => {

                bouton.disabled = true;

            }
        );


        if (boutonSelectionne) {

            boutonSelectionne
                .classList.add(
                    "selection"
                );

        }


        /*
            Ferme immédiatement la popup.

            Il ne faut pas utiliser de setTimeout ici,
            car cela pourrait supprimer les choix
            de la scène suivante.
        */

        this.fermerPopup();

        this.conteneur.innerHTML = "";

    },


    /*=====================================================
        OUVRIR LA POPUP
    =====================================================*/

    ouvrirPopup() {

        if (!this.popup) {

            return;

        }

        this.popup.classList.add(
            "ouverte"
        );

        this.popup.setAttribute(
            "aria-hidden",
            "false"
        );

    },


    /*=====================================================
        FERMER LA POPUP
    =====================================================*/

    fermerPopup() {

        if (!this.popup) {

            return;

        }

        this.popup.classList.remove(
            "ouverte"
        );

        this.popup.setAttribute(
            "aria-hidden",
            "true"
        );

    },


    /*=====================================================
        VIDER LES CHOIX
    =====================================================*/

    vider() {

        if (!this.conteneur) {

            return;

        }

        this.conteneur.innerHTML = "";

        this.verrouille = false;

    },


    /*=====================================================
        DÉSACTIVER LES CHOIX
    =====================================================*/

    desactiver() {

        if (!this.conteneur) {

            return;

        }

        this.verrouille = true;


        this.conteneur
            .querySelectorAll(
                "button"
            )
            .forEach(
                bouton => {

                    bouton.disabled = true;

                }
            );

    },


    /*=====================================================
        RÉACTIVER LES CHOIX
    =====================================================*/

    activer() {

        if (!this.conteneur) {

            return;

        }

        this.verrouille = false;


        this.conteneur
            .querySelectorAll(
                "button:not(.locked)"
            )
            .forEach(
                bouton => {

                    bouton.disabled = false;

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

        choixManager.initialiser();

    }
);
