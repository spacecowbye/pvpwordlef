import express from "express";
import { ok } from "node:assert";
import { gameController } from "../controllers/game.controller.js";

const router = express.Router();


router.get(`/duel/:room`,gameController);


export default router;


