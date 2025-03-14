const User = require("../models/user.model").default;
import { MysqlError } from "mysql";
import { Request, Response } from "express";

type MySqlCustomError = MysqlError & { kind?: string };

interface userData {
    user_name: string;
    password: string;
    privilige: number;
    user_picture: string;
}

/**
 * Le contrôleur sert d'intermédiaire entre le modèle et les routes.
 * Il filtre les données envoyées au modèle et transmet les erreurs du modèle à l'application.
 */

/**
 * Recherche un utilisateur par son ID.
 * Vérifie que l'ID est bien fourni avant d'effectuer la requête.
 * Renvoie une erreur si l'utilisateur n'est pas trouvé ou si une erreur serveur survient.
 */
exports.findUser = (req: Request, res: Response) => {
    if (!req.params.id) {
        return res.status(400).send({
            message: "Veuillez fournir un ID !"
        });
    } 

    User.findById(req.params.id, (err: MySqlCustomError | null, userData: userData | null) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: "Aucun utilisateur trouvé avec cet ID."
                });
            } else {
                console.error("Erreur lors de la recherche de l'utilisateur :", err);
                return res.status(500).send({
                    message: "Erreur interne du serveur."
                });
            }
        } else {
            return res.send(userData);
        }
    });
};

/**
 * Gère l'authentification d'un utilisateur.
 * Vérifie que les champs 'user_name' et 'password' sont renseignés.
 * Renvoie une erreur si les informations sont incorrectes ou si une erreur serveur survient.
 */
exports.login = (req: Request, res: Response) => {
    console.log(req.body);

    if (!req.body || req.body.password === '' || req.body.user_name === '') {
        return res.status(400).send({
            message: "Le nom d'utilisateur et le mot de passe sont requis."
        });
    } 

    User.login(req.body, (err: MySqlCustomError | null, userData: userData | null) => {
        if (err) {
            if (err.name === "not_found") {
                return res.status(404).send({
                    message: "Nom d'utilisateur ou mot de passe incorrect."
                });
            } else {
                console.error("Erreur lors de la connexion :", err);
                return res.status(500).send({
                    message: "Erreur interne du serveur."
                });
            }
        } else {
            return res.send(userData);
        }
    });
};

/**
 * Met à jour les informations d'un utilisateur.
 * Vérifie que l'ID et les nouvelles données sont bien fournis.
 * Renvoie une erreur si l'utilisateur n'existe pas ou en cas d'erreur serveur.
 */
exports.update = (req: Request, res: Response) => {
    if (!req.body || !req.params.id) {
        return res.status(400).send({
            message: "Les données de mise à jour sont requises."
        });
    }

    User.updateById(
        req.params.id,
        new User(req.body),
        (err: MySqlCustomError | null, data: userData | null) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Utilisateur avec l'ID ${req.params.id} non trouvé.`
                    });
                } else {
                    return res.status(500).send({
                        message: `Erreur lors de la mise à jour de l'utilisateur avec l'ID ${req.params.id}.`
                    });
                }
            } else {
                return res.send(data);
            }
        }
    );
};

/**
 * Supprime un utilisateur de la base de données.
 * Vérifie que l'ID est bien fourni.
 * Renvoie une erreur si l'utilisateur n'existe pas ou en cas d'erreur serveur.
 */
exports.delete = (req: Request, res: Response) => {
    User.remove(req.params.id, (err: MySqlCustomError, data: userData | null) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Utilisateur avec l'ID ${req.params.id} non trouvé.`
                });
            } else {
                return res.status(500).send({
                    message: `Erreur lors de la suppression de l'utilisateur avec l'ID ${req.params.id}.`
                });
            }
        } else {
            return res.send({ message: "Utilisateur supprimé avec succès !" });
        }
    });
};
