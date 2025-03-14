import sql from "./db";
import bcrypt from "bcrypt";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface User {
    user_id?: number;
    user_name: string;
    password: string;
    privilege?: string | null;
    user_picture?: string | null;
}

type ResultCallback<T> = (err: Error | null, result: T | null) => void;


const user = {    
    /**
     * Authentifie un utilisateur en comparant son mot de passe haché avec celui en base de données.
     */
    login: (user: { user_name: string; password: string }, result: ResultCallback<User | null>) => {
        sql.query("SELECT * FROM utilisateur WHERE user_name = ?", [user.user_name], (err, res: RowDataPacket[]) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            if (res.length) {
                // Vérifie si le mot de passe fourni correspond à celui en base de données
                bcrypt.compare(user.password, res[0].password, (err, isMatch) => {
                    if (err) {
                        console.error("Erreur:", err);
                        result(err, null);
                        return;
                    }
                    if (isMatch) {
                        console.log("Utilisateur trouvé");
                        result(null, res[0] as User);
                    } else {
                        result({ name: "not_found", message: "Utilisateur non trouvé" }, null);
                    }
                });
            } else {
                result({ name: "not_found", message: "Utilisateur non trouvé" }, null);
            }
        });
    },

    /**
     * Recherche un utilisateur par son ID.
     */
    findById: (id: number, result: ResultCallback<User | null>) => {
        sql.query("SELECT * FROM utilisateur WHERE user_id = ?", [id], (err, res: RowDataPacket[]) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            if (res.length) {
                console.log("Utilisateur trouvé: ", res[0]);
                result(null, res[0] as User);
            } else {
                result({ name: "not_found", message: "Utilisateur non trouvé" }, null);
            }
        });
    },

    /**
     * Met à jour un utilisateur dans la base de données.
     */
    updateById: (id: number, user: User, result: ResultCallback<User | null>) => {
        sql.query(
            "UPDATE utilisateur SET user_name = ?, password = ?, privilege = ?, user_picture = ? WHERE user_id = ?",
            [user.user_name, user.password, user.privilege, user.user_picture, id],
            (err, res: ResultSetHeader) => {
                if (err) {
                    console.error("Erreur:", err);
                    result(err, null);
                    return;
                }
                if (res.affectedRows === 0) {
                    result({ name: "not_found", message: "Utilisateur non trouvé" }, null);
                    return;
                }
                console.log("Utilisateur mis à jour: ", { id, ...user });
                result(null, { ...user, user_id: id });
            }
        );
    },

    /**
     * Supprime un utilisateur en fonction de son ID.
     */
    remove: (id: number, result: ResultCallback<{ affectedRows: number } | null>) => {
        sql.query("DELETE FROM utilisateur WHERE user_id = ?", [id], (err, res: ResultSetHeader) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            if (res.affectedRows === 0) {
                result({ name: "not_found", message: "Utilisateur non trouvé" }, null);
                return;
            }
            console.log("Utilisateur supprimé avec l'ID: ", id);
            result(null, res);
        });
    }
};


export default user;
