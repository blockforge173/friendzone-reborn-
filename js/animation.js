/* ==========================================
   FRIENDZONÉ REBORN
   animation.js
========================================== */

const animationManager = {

    // Apparition d'une bulle
    apparition(element, classe = "message") {

        if (!element) return;

        element.classList.remove(classe);

        void element.offsetWidth;

        element.classList.add(classe);

    },

    // Effet SMS reçu
    reception(element) {

        if (!element) return;

        element.classList.remove("recu");

        void element.offsetWidth;

        element.classList.add("recu");

    },

    // Effet SMS envoyé
    envoi(element) {

        if (!element) return;

        element.classList.remove("envoye");

        void element.offsetWidth;

        element.classList.add("envoye");

    },

    // Secousse
    shake(element) {

        if (!element) return;

        element.classList.remove("shake");

        void element.offsetWidth;

        element.classList.add("shake");

    },

    // Battement
    pulse(element) {

        if (!element) return;

        element.classList.add("pulse");

    },

    stopPulse(element) {

        if (!element) return;

        element.classList.remove("pulse");

    },

    // Fade In
    fadeIn(element, duree = 500) {

        if (!element) return;

        element.style.transition =
            `opacity ${duree}ms`;

        element.style.opacity = 0;

        setTimeout(() => {

            element.style.opacity = 1;

        }, 20);

    },

    // Fade Out
    fadeOut(element, duree = 500, callback = null) {

        if (!element) return;

        element.style.transition =
            `opacity ${duree}ms`;

        element.style.opacity = 0;

        setTimeout(() => {

            if (callback)
                callback();

        }, duree);

    },

    // Transition écran noir
    transitionVersNoir(callback = null) {

        const transition =
            document.getElementById("transition");

        if (!transition)
            return;

        transition.classList.add("actif");

        setTimeout(() => {

            if (callback)
                callback();

        }, 1000);

    },

    // Sortie du noir
    sortirDuNoir() {

        const transition =
            document.getElementById("transition");

        if (!transition)
            return;

        transition.classList.remove("actif");

    },

    // Défilement automatique
    scrollConversation() {

        const conversation =
            document.getElementById("conversation");

        if (!conversation)
            return;

        conversation.scrollTo({

            top: conversation.scrollHeight,

            behavior: "smooth"

        });

    },

    // Petit délai
    attendre(ms) {

        return new Promise(resolve => {

            setTimeout(resolve, ms);

        });

    }

};