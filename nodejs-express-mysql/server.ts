import dotenv from 'dotenv'
dotenv.config();

import express from "express";
import cors from "cors";
import sql = require("./app/models/db");
import mysql, { RowDataPacket } from "mysql2"; // Importation de mysql2
import multer from "multer";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { exec } from 'child_process';
import path from 'path';

/**
 *  Ce fichier est le point d'entrée de l'API
 *  c'est içi que le frontend communique avec le backend.
 *  
 *  Le projet est divisé en 3 parties:
 *  - Les routes définissent les chemins permettant d’accéder aux contrôleurs ainsi que
 *  la méthode utilisée pour y accéder. 
 *  - Les contrôleurs filtrent les données envoyées par la requête. Si les données 
 *  envoyées dans la requête sont valides, le contrôleur fait appel au modèle avec les 
 *  données passées dans la requête. Si les données sont invalides ou si le modèle 
 *  renvoie une erreur, le contrôleur renverra une erreur.
 *  - Les modèles se chargent de l'interaction avec la base de données. Un modèle
 *   effectue les requêtes SQL sur la base de données.
 * 
 *   Cependant, en dehors de ce schéma, il y a la fonction "createDefaultAdmin" qui 
 *   créer un utilisateur par défaut au cas où il n'y a pas d'utilisateur.
 *   Il doit être enclenché lors du démarrage du serveur.
 * 
 *   Même chose pour "restoreDB" çelà permet de créer une base de données si la base
 *   de données n'existe pas encore.
 * 
 *   Aussi, le chemin qui permet de créer les utilisateur est très compliqué à mettre
 *   en place dans le schéma présenté çi-dessus à cause de la bibliothèque multer
 *   qui permet d'uploader les images.
 */

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

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,        // Utilisateur MySQL
    password: process.env.DB_PASSWORD // Mot de passe de l'utilisateur
});
  
// Vérifier si la base de données existe et la créer si nécessaire
const checkAndCreateDatabase = () => {
    const databaseName = 'nextLogin';  // Le nom de la base de données à vérifier
    const backupFilePath = path.join(__dirname, 'backup.sql'); // Chemin du fichier de backup
    
    // Vérifier si la base de données existe déjà
    sql.query(`SHOW DATABASES LIKE ?`,[databaseName],(err, rows: any) => {
      if (err) {
        console.error('❌ Erreur lors de la vérification de la base de données:', err);
        return;
      }
  
      if (rows.length > 0) {
        console.log(`✅ La base de données "${databaseName}" existe déjà.`);
      } else {
        console.log(`❌ La base de données "${databaseName}" n'existe pas.`);
        // Créer la base de données si elle n'existe pas
        connection.query(`CREATE DATABASE ${databaseName}`, (err) => {
          if (err) {
            console.error('❌ Erreur lors de la création de la base de données:', err);
            return;
          }
          console.log(`🛠 Base de données "${databaseName}" créée.`);
          // Une fois la base de données créée, se reconnecter à la nouvelle base
          connection.changeUser({ database: databaseName }, (err) => {
            if (err) {
              console.error('❌ Erreur lors de la reconnexion à la base de données:', err);
            } else {
              console.log(`✅ Connexion réussie à la base de données "${databaseName}".`);
              // Importer le backup dans la base de données
              importBackup();
            }
          });
        });
      }
    });
  
    // Fonction pour importer le fichier de backup
    const importBackup = () => {
      exec(`mysql --defaults-extra-file=${path.join(__dirname, '.my.cnf')} ${databaseName} < ${backupFilePath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Erreur lors de l'importation du backup : ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`❌ Erreur lors de l'importation du backup : ${stderr}`);
          return;
        }
        console.log(`✅ Backup ${databaseName} importé avec succès.`);
        
      });
    };
  };
  
  // Lancer la vérification et création de la base de données
  checkAndCreateDatabase();

/**
 * C'est le point d'entrée qui permet de créer un nouvel utilisateur.
*/

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