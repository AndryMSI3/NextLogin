const User = require("../models/user.model").default;
import { MysqlError } from "mysql";
import { Request, Response } from "express";

type MySqlCustomError = MysqlError & { kind?: string };

interface userData {
    user_name:string;
    password: string;
    privilige: number;
    user_picture: string;
}

exports.findUser = (req: Request, res: Response) => {
    if (!req.params.id) {
        return res.status(400).send({
            message: "Veuillez donnez un ID!"
        });
    } 

    User.findById(req.params.id, (err: MySqlCustomError| null, userData: userData | null) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: "Aucun utilisateur avec cette ID !"
                });
            } else {
                console.error("Erreur lors de la connexion :", err);
                return res.status(500).send({
                    message: "Erreur interne du serveur"
                });
            }
        } else {
            return res.send(userData);
        }
    });
};

exports.login = (req: Request, res: Response) => {
    console.log(req.body);
    // Valide la requête
    if (!req.body || req.body.password == '' || req.body.user_name == '') {
        return res.status(400).send({
            message: "Le contenu ne peut pas être vide !"
        });
    } 

    // Teste si l'utilisateur existe dans la base de données
    User.login(req.body, (err: MySqlCustomError| null, userData: userData | null) => {
        if (err) {
            if (err.name === "not_found") {
                return res.status(404).send({
                    message: "Nom d'utilisateur ou mot de passe incorrect"
                });
            } else {
                console.error("Erreur lors de la connexion :", err);
                return res.status(500).send({
                    message: "Erreur interne du serveur"
                });
            }
        } else {
            return res.send(userData);
        }
    });
};


exports.findAll = (req: Request, res: Response) => {
    const username = req.query.username;

    User.getAll(username, (err: MySqlCustomError | null, data: userData[] | null) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Une erreur est survenue lors de la récupération des utilisateurs."
            });
        } else {
            return res.send(data);
        }
    });
};

exports.findAllPrivilege = (req: Request, res: Response) => {
    User.getAllPrivilege((err: MySqlCustomError | null, data: userData[] | null ) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Une erreur est survenue lors de la récupération des utilisateurs avec privilège."
            });
        } else {
            return res.send(data);
        }
    });
};

exports.findOne = (req: Request, res: Response) => {
    User.findById(req.params.id, (err: MySqlCustomError | null, data: userData | null) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Utilisateur avec l'ID ${req.params.id} non trouvé.`
                });
            } else {
                return res.status(500).send({
                    message: "Erreur lors de la récupération de l'utilisateur avec l'ID " + req.params.id
                });
            }
        } else {
            return res.send(data);
        }
    });
};

exports.update = (req: Request, res: Response) => {
    // Valide la requête
    if (!req.body) {
        return res.status(400).send({
            message: "Le contenu ne peut pas être vide !"
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
                        message: "Erreur lors de la mise à jour de l'utilisateur avec l'ID " + req.params.id
                    });
                }
            } else {
                return res.send(data);
            }
        }
    );
};

exports.delete = (req: Request, res: Response) => {
    User.remove(req.params.id, (err: MySqlCustomError, data: userData | null) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Utilisateur avec l'ID ${req.params.id} non trouvé.`
                });
            } else {
                return res.status(500).send({
                    message: "Erreur lors de la suppression de l'utilisateur avec l'ID " + req.params.id
                });
            }
        } else {
            return res.send({ message: "Utilisateur supprimé avec succès !" });
        }
    });
};

exports.deleteAll = (req: Request, res: Response) => {
    User.removeAll((err: MySqlCustomError | null, data: userData[] | null) => {
        if (err) {
            return res.status(500).send({
                message: err.message || "Une erreur est survenue lors de la suppression de tous les utilisateurs."
            });
        } else {
            return res.send({ message: "Tous les utilisateurs ont été supprimés avec succès !" });
        }
    });
};
