import mysql, { Connection, MysqlError } from "mysql";
import dbConfig from "../config/db.config";

// Crée une connexion à la base de données
const connection: Connection = mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    charset: 'utf8mb4',
});

// Ouvre la connexion MySQL
connection.connect((error: MysqlError | null) => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

// Fonction pour exécuter une requête SQL
export function query(sql: string, params: any[], callback: (err: MysqlError | null, result: any) => void) {
    connection.query(sql, params, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

export default connection;
