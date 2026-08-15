"use strict";

const conditionsManager = {

    verifierCondition(
        condition,
        joueur
    ) {

        if (!condition) {
            return true;
        }

        const valeurActuelle =
            joueur[condition.variable];

        const valeurAttendue =
            condition.valeur;

        switch (
            condition.operateur || "=="
        ) {

            case ">":
                return valeurActuelle > valeurAttendue;

            case ">=":
                return valeurActuelle >= valeurAttendue;

            case "<":
                return valeurActuelle < valeurAttendue;

            case "<=":
                return valeurActuelle <= valeurAttendue;

            case "===":
                return valeurActuelle === valeurAttendue;

            case "!==":
                return valeurActuelle !== valeurAttendue;

            case "!=":
                return valeurActuelle != valeurAttendue;

            default:
                return valeurActuelle == valeurAttendue;

        }

    },

    verifierConditions(
        conditions,
        joueur
    ) {

        if (!conditions) {
            return true;
        }

        if (!Array.isArray(conditions)) {

            return this.verifierCondition(
                conditions,
                joueur
            );

        }

        return conditions.every(
            condition =>
                this.verifierCondition(
                    condition,
                    joueur
                )
        );

    },

    verifierAccesScene(
        scene,
        joueur
    ) {

        return this.verifierConditions(
            scene.condition,
            joueur
        );

    },

    obtenirRedirection(
        scene,
        joueur
    ) {

        if (!Array.isArray(scene.redirections)) {

            return null;

        }

        for (const redirection of scene.redirections) {

            if (
                !redirection.condition ||
                this.verifierConditions(
                    redirection.condition,
                    joueur
                )
            ) {

                return redirection.next;

            }

        }

        return null;

    },

    preparerChoix(
        choix,
        joueur
    ) {

        return choix
            .filter(item => {

                return this.verifierConditions(
                    item.condition,
                    joueur
                );

            })
            .map(item => {

                const copie = {
                    ...item
                };

                if (
                    item.conditionVerrouillage
                ) {

                    copie.verrouille =
                        !this.verifierConditions(
                            item.conditionVerrouillage,
                            joueur
                        );

                    if (
                        copie.verrouille &&
                        item.texteVerrouille
                    ) {

                        copie.texte =
                            item.texteVerrouille;

                    }

                }

                return copie;

            });

    },

    appliquerEffet(
        effet,
        joueur
    ) {

        if (!effet) {
            return;
        }

        for (
            const [variable, valeur]
            of Object.entries(effet)
        ) {

            if (
                typeof valeur === "number"
            ) {

                if (
                    typeof joueur[variable]
                    !== "number"
                ) {

                    joueur[variable] = 0;

                }

                joueur[variable] += valeur;

            }
            else {

                joueur[variable] = valeur;

            }

        }

    },

    appliquerEffets(
        effets,
        joueur
    ) {

        if (!Array.isArray(effets)) {
            return;
        }

        effets.forEach(effet => {

            if (
                !effet.condition ||
                this.verifierConditions(
                    effet.condition,
                    joueur
                )
            ) {

                this.appliquerEffet(
                    effet.effet ||
                    effet.valeurs,
                    joueur
                );

            }

        });

    },

    resoudreDestination(
        choix,
        joueur
    ) {

        if (choix.next) {
            return choix.next;
        }

        if (
            Array.isArray(
                choix.destinations
            )
        ) {

            for (
                const destination
                of choix.destinations
            ) {

                if (
                    !destination.condition ||
                    this.verifierConditions(
                        destination.condition,
                        joueur
                    )
                ) {

                    return destination.next;

                }

            }

        }

        return null;

    }

};