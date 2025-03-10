import sql from "./db";
import bcrypt from "bcrypt";

interface User {
    user_id?: number;
    user_name: string;
    password: string;
    privilege?: string | null;
    user_picture?: string | null;
}

type ResultCallback<T> = (err: Error | null, result: T | null) => void;

const user = {
    login: (user: { user_name: string; password: string }, result: ResultCallback<User>) => {
        sql.query("SELECT * FROM utilisateur WHERE user_name = ?", [user.user_name], (err, res) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            if (res.length) {
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
    findById: (id: number, result: ResultCallback<User>) => {
        sql.query("SELECT * FROM utilisateur WHERE user_id = ?", [id], (err, res) => {
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
    getAll: (username: string | null, result: ResultCallback<User[]>) => {
        let query = "SELECT * FROM utilisateur";
        if (username) {
            query += ` WHERE user_name LIKE '%${username}%'`;
        }
        sql.query(query, (err, res) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            console.log("Utilisateurs: ", res);
            result(null, res as User[]);
        });       
    },
    getAllPrivilege: (result: ResultCallback<User[]>) => {
        sql.query("SELECT * FROM utilisateur WHERE privilege IS NOT NULL", (err, res) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            console.log("Utilisateurs: ", res);
            result(null, res as User[]);
        });        
    },
    updateById: (id: number, user: User, result: ResultCallback<User>) => {
        sql.query(
            "UPDATE utilisateur SET user_name = ?, password = ?, privilege = ?, user_picture = ? WHERE user_id = ?",
            [user.user_name, user.password, user.privilege, user.user_picture, id],
            (err, res) => {
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
                result(null, {...user, user_id:id});
            }
        );
    },
    remove: (id: number, result: ResultCallback<{ affectedRows: number }>) => {
        sql.query("DELETE FROM utilisateur WHERE user_id = ?", [id], (err, res) => {
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
    },
    removeAll: (result: ResultCallback<{ affectedRows: number }>) => {
        sql.query("DELETE FROM utilisateur", (err, res) => {
            if (err) {
                console.error("Erreur:", err);
                result(err, null);
                return;
            }
            console.log(`Supprimé ${res.affectedRows} utilisateurs`);
            result(null, res);
        });       
    }
};

export default user;
