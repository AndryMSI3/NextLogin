const userController = require("../controllers/user.controller");
import { Router } from "express";

const router = Router();

/** 
 *  Les routes définissent les chemins permettant d’accéder aux contrôleurs ainsi que
 *  la méthode utilisée pour y accéder. 
 */


/**
 * Cette route permet d'obtenir les informations d'un utilisateur à partir de son id.
 */
router.get("/findUser/:id", userController.findUser);

/**
 * Cette route permet d'obtenir les informations d'un utilisateur à partir de son
 * nom d'utilisateur et de son mot de passe.
 */
router.post("/login", userController.login);

/**
 * Cette route permet de mettre à jour les informations d'un utilisateur à partir 
 * de son nom d'utilisateur et de son mot de passe.
 */
router.put("/:id", userController.update);

/**
 * Cette route permet de supprimer les informations d'un utilisateur à partir de son id.
 */
router.delete("/:id", userController.delete);


export default router;