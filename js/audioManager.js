"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    audioManager.js
    Audio Manager V3

    Gestion :
    - musique de fond ;
    - ambiance de scène ;
    - effets sonores ;
    - fondus sonores ;
    - pause et reprise ;
    - volumes ;
    - blocage automatique du navigateur.
=========================================================*/

const audioManager = {

    /*=====================================================
        ÉLÉMENTS AUDIO PRINCIPAUX
    =====================================================*/

    musique: new Audio(),
    ambiance: new Audio(),

    /*=====================================================
        ÉTAT AUDIO
    =====================================================*/

    musiqueActuelle: "",
    ambianceActuelle: "",

    musiqueEnPause: false,
    ambianceEnPause: false,

    audioDebloque: false,

    /*=====================================================
        VOLUMES
    =====================================================*/

    volumeMusique: 0.40,
    volumeAmbiance: 0.25,
    volumeEffets: 0.70,

    /*=====================================================
        DOSSIERS AUDIO
    =====================================================*/

    chemins: {

        musique: "audio/",
        ambiance: "audio/ambiance/",
        sons: "audio/sons/"

    },

    /*=====================================================
        INTERVALLES DE FONDU
    =====================================================*/

    intervalleMusique: null,
    intervalleAmbiance: null,

    /*=====================================================
        INITIALISATION
    =====================================================*/

    initialiser() {

        this.musique.loop = true;
        this.ambiance.loop = true;

        this.musique.preload = "auto";
        this.ambiance.preload = "auto";

        this.musique.volume =
            this.limiterVolume(
                this.volumeMusique
            );

        this.ambiance.volume =
            this.limiterVolume(
                this.volumeAmbiance
            );

        /*
            Le navigateur bloque souvent le son tant que
            le joueur n'a pas effectué une interaction.

            Le premier clic ou la première touche permet
            de débloquer la lecture audio.
        */

        const debloquerAudio = () => {

            this.audioDebloque = true;

            document.removeEventListener(
                "click",
                debloquerAudio
            );

            document.removeEventListener(
                "keydown",
                debloquerAudio
            );

            document.removeEventListener(
                "touchstart",
                debloquerAudio
            );

        };

        document.addEventListener(
            "click",
            debloquerAudio,
            {
                once: true
            }
        );

        document.addEventListener(
            "keydown",
            debloquerAudio,
            {
                once: true
            }
        );

        document.addEventListener(
            "touchstart",
            debloquerAudio,
            {
                once: true
            }
        );

        console.log(
            "audioManager initialisé."
        );

    },

    /*=====================================================
        LIMITER UN VOLUME ENTRE 0 ET 1
    =====================================================*/

    limiterVolume(volume) {

        const valeur =
            Number(
                volume
            );

        if (!Number.isFinite(valeur)) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(
                1,
                valeur
            )
        );

    },

    /*=====================================================
        CONSTRUIRE UN CHEMIN AUDIO
    =====================================================*/

    construireChemin(
        dossier,
        nom
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {
            return "";
        }

        const nomNettoye =
            nom.trim();

        /*
            Si l'extension est déjà présente,
            elle n'est pas ajoutée une seconde fois.
        */

        if (
            nomNettoye.endsWith(
                ".mp3"
            ) ||
            nomNettoye.endsWith(
                ".ogg"
            ) ||
            nomNettoye.endsWith(
                ".wav"
            )
        ) {

            return (
                dossier +
                nomNettoye
            );

        }

        return (
            dossier +
            nomNettoye +
            ".mp3"
        );

    },

    /*=====================================================
        LECTURE AUDIO SÉCURISÉE
    =====================================================*/

    async lancerLecture(
        audio,
        nom = "audio"
    ) {

        if (!audio) {
            return false;
        }

        try {

            await audio.play();

            this.audioDebloque = true;

            return true;

        }
        catch (erreur) {

            /*
                NotAllowedError signifie généralement que
                le navigateur attend une interaction.
            */

            if (
                erreur &&
                erreur.name === "NotAllowedError"
            ) {

                console.warn(
                    `audioManager : lecture de "${nom}" bloquée jusqu'à une interaction du joueur.`
                );

            }
            else {

                console.warn(
                    `audioManager : impossible de lire "${nom}".`,
                    erreur
                );

            }

            return false;

        }

    },

    /*=====================================================
        ARRÊTER UN INTERVALLE DE FONDU
    =====================================================*/

    arreterFonduMusique() {

        if (
            this.intervalleMusique !== null
        ) {

            clearInterval(
                this.intervalleMusique
            );

            this.intervalleMusique =
                null;

        }

    },

    arreterFonduAmbiance() {

        if (
            this.intervalleAmbiance !== null
        ) {

            clearInterval(
                this.intervalleAmbiance
            );

            this.intervalleAmbiance =
                null;

        }

    },

    /*=====================================================
        MUSIQUE
    =====================================================*/

    jouerMusique(
        nom,
        volume = this.volumeMusique
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {

            this.arreterMusique();

            return;

        }

        if (
            nom === "aucune" ||
            nom === "aucun"
        ) {

            this.arreterMusique();

            return;

        }

        const nomNettoye =
            nom.trim();

        const volumeFinal =
            this.limiterVolume(
                volume
            );

        /*
            Si la même musique joue déjà,
            on met seulement à jour le volume.
        */

        if (
            this.musiqueActuelle ===
                nomNettoye &&
            !this.musique.paused
        ) {

            this.musique.volume =
                volumeFinal;

            return;

        }

        this.arreterFonduMusique();

        this.musique.pause();

        this.musique.src =
            this.construireChemin(
                this.chemins.musique,
                nomNettoye
            );

        this.musique.currentTime =
            0;

        this.musique.volume =
            volumeFinal;

        this.musique.loop =
            true;

        this.musiqueActuelle =
            nomNettoye;

        this.musiqueEnPause =
            false;

        this.lancerLecture(
            this.musique,
            nomNettoye
        );

    },

    /*=====================================================
        FONDU D'ENTRÉE DE LA MUSIQUE
    =====================================================*/

    fadeIn(
        nom,
        duree = 1200,
        volume = this.volumeMusique
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {
            return;
        }

        const nomNettoye =
            nom.trim();

        const volumeCible =
            this.limiterVolume(
                volume
            );

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        this.arreterFonduMusique();

        /*
            Si ce n'est pas la même musique,
            on charge le nouveau fichier.
        */

        if (
            this.musiqueActuelle !==
            nomNettoye
        ) {

            this.musique.pause();

            this.musique.src =
                this.construireChemin(
                    this.chemins.musique,
                    nomNettoye
                );

            this.musique.currentTime =
                0;

            this.musiqueActuelle =
                nomNettoye;

        }

        this.musique.loop =
            true;

        this.musique.volume =
            0;

        this.musiqueEnPause =
            false;

        this.lancerLecture(
            this.musique,
            nomNettoye
        );

        if (
            dureeFinale === 0
        ) {

            this.musique.volume =
                volumeCible;

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        const pas =
            volumeCible /
            nombreEtapes;

        let volumeActuel =
            0;

        this.intervalleMusique =
            setInterval(
                () => {

                    volumeActuel +=
                        pas;

                    if (
                        volumeActuel >=
                        volumeCible
                    ) {

                        volumeActuel =
                            volumeCible;

                        this.arreterFonduMusique();

                    }

                    this.musique.volume =
                        this.limiterVolume(
                            volumeActuel
                        );

                },
                intervalle
            );

    },

    /*=====================================================
        FONDU DE SORTIE DE LA MUSIQUE
    =====================================================*/

    fadeOut(
        duree = 1200,
        arreterCompletement = true
    ) {

        this.arreterFonduMusique();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        if (
            this.musique.paused
        ) {

            if (arreterCompletement) {
                this.arreterMusique();
            }

            return;

        }

        const volumeDepart =
            this.musique.volume;

        if (
            dureeFinale === 0 ||
            volumeDepart <= 0
        ) {

            this.musique.volume =
                0;

            this.musique.pause();

            if (arreterCompletement) {

                this.musique.currentTime =
                    0;

                this.musiqueActuelle =
                    "";

            }

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        const pas =
            volumeDepart /
            nombreEtapes;

        let volumeActuel =
            volumeDepart;

        this.intervalleMusique =
            setInterval(
                () => {

                    volumeActuel -=
                        pas;

                    if (
                        volumeActuel <= 0
                    ) {

                        volumeActuel =
                            0;

                        this.musique.volume =
                            0;

                        this.musique.pause();

                        this.arreterFonduMusique();

                        if (
                            arreterCompletement
                        ) {

                            this.musique.currentTime =
                                0;

                            this.musiqueActuelle =
                                "";

                        }

                        return;

                    }

                    this.musique.volume =
                        this.limiterVolume(
                            volumeActuel
                        );

                },
                intervalle
            );

    },

    /*=====================================================
        CHANGER DE MUSIQUE AVEC TRANSITION
    =====================================================*/

    changerMusique(
        nom,
        duree = 800
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {
            return;
        }

        const nomNettoye =
            nom.trim();

        if (
            this.musiqueActuelle ===
            nomNettoye
        ) {
            return;
        }

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        if (
            !this.musiqueActuelle ||
            this.musique.paused
        ) {

            this.fadeIn(
                nomNettoye,
                dureeFinale
            );

            return;

        }

        /*
            Le nom actuel est conservé pendant le fade out,
            puis remplacé par la nouvelle musique.
        */

        this.fadeOut(
            dureeFinale,
            false
        );

        setTimeout(
            () => {

                this.fadeIn(
                    nomNettoye,
                    dureeFinale
                );

            },
            dureeFinale
        );

    },

    /*=====================================================
        ARRÊTER LA MUSIQUE
    =====================================================*/

    arreterMusique() {

        this.arreterFonduMusique();

        this.musique.pause();

        try {

            this.musique.currentTime =
                0;

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de réinitialiser la musique.",
                erreur
            );

        }

        this.musique.removeAttribute(
            "src"
        );

        this.musique.load();

        this.musiqueActuelle =
            "";

        this.musiqueEnPause =
            false;

    },

    /*=====================================================
        AMBIANCE
    =====================================================*/

    jouerAmbiance(
        nom,
        volume = this.volumeAmbiance
    ) {

        if (
            nom === null ||
            nom === undefined ||
            nom === "" ||
            nom === "aucune" ||
            nom === "aucun"
        ) {

            this.arreterAmbiance();

            return;

        }

        const nomNettoye =
            String(
                nom
            ).trim();

        const volumeFinal =
            this.limiterVolume(
                volume
            );

        /*
            Si la même ambiance joue déjà,
            elle ne redémarre pas.
        */

        if (
            this.ambianceActuelle ===
                nomNettoye &&
            !this.ambiance.paused
        ) {

            this.ambiance.volume =
                volumeFinal;

            return;

        }

        this.arreterFonduAmbiance();

        this.ambiance.pause();

        this.ambiance.src =
            this.construireChemin(
                this.chemins.ambiance,
                nomNettoye
            );

        this.ambiance.currentTime =
            0;

        this.ambiance.volume =
            volumeFinal;

        this.ambiance.loop =
            true;

        this.ambianceActuelle =
            nomNettoye;

        this.ambianceEnPause =
            false;

        this.lancerLecture(
            this.ambiance,
            nomNettoye
        );

    },

    /*=====================================================
        FONDU D'ENTRÉE DE L'AMBIANCE
    =====================================================*/

    fadeInAmbiance(
        nom,
        duree = 800,
        volume = this.volumeAmbiance
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === ""
        ) {
            return;
        }

        const nomNettoye =
            nom.trim();

        const volumeCible =
            this.limiterVolume(
                volume
            );

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        this.arreterFonduAmbiance();

        if (
            this.ambianceActuelle !==
            nomNettoye
        ) {

            this.ambiance.pause();

            this.ambiance.src =
                this.construireChemin(
                    this.chemins.ambiance,
                    nomNettoye
                );

            this.ambiance.currentTime =
                0;

            this.ambianceActuelle =
                nomNettoye;

        }

        this.ambiance.loop =
            true;

        this.ambiance.volume =
            0;

        this.ambianceEnPause =
            false;

        this.lancerLecture(
            this.ambiance,
            nomNettoye
        );

        if (
            dureeFinale === 0
        ) {

            this.ambiance.volume =
                volumeCible;

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        const pas =
            volumeCible /
            nombreEtapes;

        let volumeActuel =
            0;

        this.intervalleAmbiance =
            setInterval(
                () => {

                    volumeActuel +=
                        pas;

                    if (
                        volumeActuel >=
                        volumeCible
                    ) {

                        volumeActuel =
                            volumeCible;

                        this.arreterFonduAmbiance();

                    }

                    this.ambiance.volume =
                        this.limiterVolume(
                            volumeActuel
                        );

                },
                intervalle
            );

    },

    /*=====================================================
        FONDU DE SORTIE DE L'AMBIANCE
    =====================================================*/

    fadeOutAmbiance(
        duree = 800,
        arreterCompletement = true
    ) {

        this.arreterFonduAmbiance();

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        if (
            this.ambiance.paused
        ) {

            if (arreterCompletement) {
                this.arreterAmbiance();
            }

            return;

        }

        const volumeDepart =
            this.ambiance.volume;

        if (
            dureeFinale === 0 ||
            volumeDepart <= 0
        ) {

            this.ambiance.volume =
                0;

            this.ambiance.pause();

            if (arreterCompletement) {

                this.ambiance.currentTime =
                    0;

                this.ambianceActuelle =
                    "";

            }

            return;

        }

        const intervalle =
            40;

        const nombreEtapes =
            Math.max(
                1,
                Math.ceil(
                    dureeFinale /
                    intervalle
                )
            );

        const pas =
            volumeDepart /
            nombreEtapes;

        let volumeActuel =
            volumeDepart;

        this.intervalleAmbiance =
            setInterval(
                () => {

                    volumeActuel -=
                        pas;

                    if (
                        volumeActuel <= 0
                    ) {

                        volumeActuel =
                            0;

                        this.ambiance.volume =
                            0;

                        this.ambiance.pause();

                        this.arreterFonduAmbiance();

                        if (
                            arreterCompletement
                        ) {

                            this.ambiance.currentTime =
                                0;

                            this.ambianceActuelle =
                                "";

                        }

                        return;

                    }

                    this.ambiance.volume =
                        this.limiterVolume(
                            volumeActuel
                        );

                },
                intervalle
            );

    },

    /*=====================================================
        CHANGER D'AMBIANCE
    =====================================================*/

    changerAmbiance(
        nom,
        duree = 600,
        volume = this.volumeAmbiance
    ) {

        if (
            nom === null ||
            nom === undefined ||
            nom === "" ||
            nom === "aucune" ||
            nom === "aucun"
        ) {

            this.fadeOutAmbiance(
                duree
            );

            return;

        }

        const nomNettoye =
            String(
                nom
            ).trim();

        if (
            this.ambianceActuelle ===
            nomNettoye
        ) {

            this.ambiance.volume =
                this.limiterVolume(
                    volume
                );

            return;

        }

        const dureeFinale =
            Math.max(
                0,
                Number(duree) || 0
            );

        if (
            !this.ambianceActuelle ||
            this.ambiance.paused
        ) {

            this.fadeInAmbiance(
                nomNettoye,
                dureeFinale,
                volume
            );

            return;

        }

        this.fadeOutAmbiance(
            dureeFinale,
            false
        );

        setTimeout(
            () => {

                this.fadeInAmbiance(
                    nomNettoye,
                    dureeFinale,
                    volume
                );

            },
            dureeFinale
        );

    },

    /*=====================================================
        ARRÊTER L'AMBIANCE
    =====================================================*/

    arreterAmbiance() {

        this.arreterFonduAmbiance();

        this.ambiance.pause();

        try {

            this.ambiance.currentTime =
                0;

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de réinitialiser l'ambiance.",
                erreur
            );

        }

        this.ambiance.removeAttribute(
            "src"
        );

        this.ambiance.load();

        this.ambianceActuelle =
            "";

        this.ambianceEnPause =
            false;

    },

    /*=====================================================
        EFFETS SONORES
    =====================================================*/

    jouerSon(
        nom,
        volume = this.volumeEffets
    ) {

        if (
            typeof nom !== "string" ||
            nom.trim() === "" ||
            nom === "aucun" ||
            nom === "aucune"
        ) {
            return null;
        }

        const nomNettoye =
            nom.trim();

        const son =
            new Audio(
                this.construireChemin(
                    this.chemins.sons,
                    nomNettoye
                )
            );

        son.preload =
            "auto";

        son.volume =
            this.limiterVolume(
                volume
            );

        /*
            Une fois terminé, la référence peut être
            libérée par le navigateur.
        */

        son.addEventListener(
            "ended",
            () => {

                son.removeAttribute(
                    "src"
                );

                son.load();

            },
            {
                once: true
            }
        );

        this.lancerLecture(
            son,
            nomNettoye
        );

        return son;

    },

    /*=====================================================
        EFFETS SONORES PRÉDÉFINIS
    =====================================================*/

    jouerSucces() {

        return this.jouerSon(
            "succes"
        );

    },

    jouerChoixImportant() {

        return this.jouerSon(
            "choix-important"
        );

    },

    jouerNotification() {

        return this.jouerSon(
            "notification"
        );

    },

    jouerInformationPersonnage() {

        return this.jouerSon(
            "systeme"
        );

    },

    /*=====================================================
        PAUSE GÉNÉRALE
    =====================================================*/

    pause() {

        if (
            !this.musique.paused
        ) {

            this.musiqueEnPause =
                true;

            this.musique.pause();

        }
        else {

            this.musiqueEnPause =
                false;

        }

        if (
            !this.ambiance.paused
        ) {

            this.ambianceEnPause =
                true;

            this.ambiance.pause();

        }
        else {

            this.ambianceEnPause =
                false;

        }

    },

    /*=====================================================
        REPRISE GÉNÉRALE
    =====================================================*/

    reprendre() {

        if (
            this.musiqueEnPause &&
            this.musiqueActuelle
        ) {

            this.lancerLecture(
                this.musique,
                this.musiqueActuelle
            );

            this.musiqueEnPause =
                false;

        }

        if (
            this.ambianceEnPause &&
            this.ambianceActuelle
        ) {

            this.lancerLecture(
                this.ambiance,
                this.ambianceActuelle
            );

            this.ambianceEnPause =
                false;

        }

    },

    /*=====================================================
        ARRÊTER TOUS LES SONS CONTINUS
    =====================================================*/

    toutArreter() {

        this.arreterMusique();
        this.arreterAmbiance();

    },

    /*=====================================================
        MODIFIER LE VOLUME DE LA MUSIQUE
    =====================================================*/

    setVolumeMusique(volume) {

        this.volumeMusique =
            this.limiterVolume(
                volume
            );

        this.musique.volume =
            this.volumeMusique;

        this.sauvegarderVolumes();

    },

    /*=====================================================
        MODIFIER LE VOLUME DE L'AMBIANCE
    =====================================================*/

    setVolumeAmbiance(volume) {

        this.volumeAmbiance =
            this.limiterVolume(
                volume
            );

        this.ambiance.volume =
            this.volumeAmbiance;

        this.sauvegarderVolumes();

    },

    /*=====================================================
        MODIFIER LE VOLUME DES EFFETS
    =====================================================*/

    setVolumeEffets(volume) {

        this.volumeEffets =
            this.limiterVolume(
                volume
            );

        this.sauvegarderVolumes();

    },

    /*=====================================================
        SAUVEGARDER LES VOLUMES
    =====================================================*/

    sauvegarderVolumes() {

        try {

            localStorage.setItem(
                "friendzoneRebornVolumes",
                JSON.stringify({

                    musique:
                        this.volumeMusique,

                    ambiance:
                        this.volumeAmbiance,

                    effets:
                        this.volumeEffets

                })
            );

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de sauvegarder les volumes.",
                erreur
            );

        }

    },

    /*=====================================================
        CHARGER LES VOLUMES
    =====================================================*/

    chargerVolumes() {

        try {

            const sauvegarde =
                localStorage.getItem(
                    "friendzoneRebornVolumes"
                );

            if (!sauvegarde) {
                return;
            }

            const volumes =
                JSON.parse(
                    sauvegarde
                );

            if (
                volumes.musique !==
                undefined
            ) {

                this.volumeMusique =
                    this.limiterVolume(
                        volumes.musique
                    );

            }

            if (
                volumes.ambiance !==
                undefined
            ) {

                this.volumeAmbiance =
                    this.limiterVolume(
                        volumes.ambiance
                    );

            }

            if (
                volumes.effets !==
                undefined
            ) {

                this.volumeEffets =
                    this.limiterVolume(
                        volumes.effets
                    );

            }

            this.musique.volume =
                this.volumeMusique;

            this.ambiance.volume =
                this.volumeAmbiance;

        }
        catch (erreur) {

            console.warn(
                "audioManager : impossible de charger les volumes.",
                erreur
            );

        }

    }

};


/*=========================================================
    INITIALISATION
=========================================================*/

audioManager.chargerVolumes();
audioManager.initialiser();