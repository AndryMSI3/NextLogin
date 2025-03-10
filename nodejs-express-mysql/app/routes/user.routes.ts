const userController = require("../controllers/user.controller");
import { Router } from "express";

const router = Router();

router.get("/findUser/:id", userController.findUser);

router.post("/login", userController.login);

router.get("/privilege", userController.findAllPrivilege);

router.get("/:id", userController.findOne);

router.put("/:id", userController.update);

router.delete("/:id", userController.delete);

router.get("/", userController.findAll);

router.delete("/", userController.deleteAll);

export default router;