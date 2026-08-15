"use strict";

/*=========================================================
    FRIENDZONÉ REBORN
    sauvegarde.js
=========================================================*/

const sauvegardeManager = {

    cle: "save",


    /*=====================================================
        CRÉER LE JOUEUR PAR DÉFAUT
    =====================================================*/
creerJoueurParDefaut() {

    return {

        nom: "",

        relationEva: 0,
        confianceEva: 0,

        relationZoe: 0,
        confianceZoe: 0,

        relationEmelyne: 0,
        confianceEmelyne: 0,

        relationBryan: 0,
        confianceBryan: 0,

        gentillesse:0,
        courage:0,
        humour:0,

        audace:0,
        jalousiEva:0,

        rencontreEva: false,
        rencontreZoe: false,
        rencontreEmelyne: false,
        rencontreBryan: false,

        numeroEva:false,
        rendezVousEva:false,

        baladeEmelyne: false,
        aideZoeCafeteria: false,
        disputeBryan: false,
        repasSeulEva: false,
        emelynePresenteSoiree: false

    };

},


    /*=====================================================
        SAUVEGARDER
    =====================================================*/

    sauvegarder(
        donnees
    ) {

        if (!donnees) {

            return;

        }

        const sauvegarde = {

            version:
                "0.1",

            date:
                new Date()
                    .toISOString(),

            chapitre:
                donnees.chapitre ?? 0,

            scene:
                donnees.scene || "intro",

            joueur: {

                ...this
                    .creerJoueurParDefaut(),

                ...(donnees.joueur || {})

            },

            musique:
                donnees.musique || "",

            ambiance:
                donnees.ambiance || ""

        };


        try {

            localStorage.setItem(

                this.cle,

                JSON.stringify(
                    sauvegarde
                )

            );

        }
        catch (erreur) {

            console.error(

                "Erreur de sauvegarde :",

                erreur

            );

        }

    },


    /*=====================================================
        CHARGER
    =====================================================*/

    charger() {

        const contenu =
            localStorage.getItem(
                this.cle
            );

        if (!contenu) {

            return null;

        }


        try {

            const sauvegarde =
                JSON.parse(
                    contenu
                );


            return {

                chapitre:

                    Number.isInteger(
                        sauvegarde.chapitre
                    )

                        ? sauvegarde.chapitre

                        : 0,


                scene:

                    sauvegarde.scene ||

                    "intro",


                joueur: {

                    ...this
                        .creerJoueurParDefaut(),

                    ...(sauvegarde.joueur || {})

                },


                musique:

                    sauvegarde.musique ||

                    "",


                ambiance:

                    sauvegarde.ambiance ||

                    ""

            };

        }
        catch (erreur) {

            console.error(

                "Sauvegarde invalide :",

                erreur

            );

            this.supprimer();

            return null;

        }

    },


    /*=====================================================
        VÉRIFIER SI UNE SAUVEGARDE EXISTE
    =====================================================*/

    existe() {

        return localStorage.getItem(
            this.cle
        ) !== null;

    },


    /*=====================================================
        SUPPRIMER LA SAUVEGARDE
    =====================================================*/

    supprimer() {

        localStorage.removeItem(
            this.cle
        );

    }

};