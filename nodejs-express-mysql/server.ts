import express from "express";
import cors from "cors";
import sql = require("./app/models/db");
import multer from "multer";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const app = express();
const upload = multer({ dest: '../client/public/images' });

const corsOptions = {
    origin: "http://localhost:3000"
};

// Importation des routes API

import userRoutes from "./app/routes/user.routes";

const SALT_ROUNDS = 10;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createDefaultAdmin = () => {
    sql.query("SELECT COUNT(*) AS count FROM utilisateur",[],(err, rows) => {
        if (err) {
            console.error("❌ Erreur lors de la vérification des utilisateurs :", err);
            return;
        }

        if (rows[0].count === 0) {
            console.log("⚠️ Aucun utilisateur trouvé. Création d'un administrateur par défaut...");

            const defaultUserName = "admin";
            const defaultPassword = "P@ssw0rd"; // À changer après la première connexion
            const defaultPrivilege = 2;
            const defaultUserPicture = "";

            bcrypt.hash(defaultPassword, SALT_ROUNDS, (err, hashedPassword) => {
                if (err) {
                    console.error("❌ Erreur lors du hachage du mot de passe :", err);
                    return;
                }

                sql.query(
                    "INSERT INTO utilisateur (user_name, password, privilege, user_picture) VALUES (?, ?, ?, ?)",
                    [defaultUserName, hashedPassword, defaultPrivilege, defaultUserPicture],
                    (err) => {
                        if (err) {
                            console.error("❌ Erreur lors de la création de l'admin :", err);
                        } else {
                            console.log("✅ Administrateur par défaut créé avec succès !");
                        }
                    }
                );
            });
        } else {
            console.log("✅ Utilisateurs déjà présents. Aucune action requise.");
        }
    });
};

createDefaultAdmin();

app.post(
    "/api/users/create", 
    upload.single('image'), 
    async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("errors: ", errors);
        res.status(400).json({ errors: errors.array() });
        return;
    }

    if (!req.file) {
        res.status(400).json({ error: "Image is required" });
        return;
    }
    const userPicture = req.file.filename;
    const userName = req.body.userName;
    const password = req.body.passWord;
    const privilege = req.body.privilege;
    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
        if (err) {
            console.log("error:", err);
            res.status(500).send({ error: "Error while generating salt" });
            return;
        }
        bcrypt.hash(password, salt, (err, hashedPassword) => {
            if (err) {
                console.log("error:", err);
                res.status(500).send({ error: "Error while hashing password" });
                return;
            }
            sql.query("INSERT INTO utilisateur(user_name, password, privilege, user_picture) VALUES (?, ?, ?, ?)",
                [userName, hashedPassword, privilege, userPicture], (err: Error | null, result: any) => {
                    if (err) {
                        console.log("error:", err); 
                        res.status(500).send({ error: "Internal Server Error" });
                        return;
                    }
                    res.send({ userPicture, userName, hashedPassword, privilege });
                });
        });
    });
});

// Routes API
app.use("/users", userRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
}); 