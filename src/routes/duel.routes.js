// duel.routes.js

import express from "express";
import { gameController, serveDuelUI } from "../controllers/game.controller.js";

const router = express.Router();

router.get('/duel/:room_id',serveDuelUI);



export default router;


