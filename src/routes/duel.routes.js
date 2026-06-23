import express from "express";
import { ok } from "node:assert";

const router = express.Router();


router.get(`/game/:room`,(req,res) => {
    res.status(200).json({
        "status" : "ok",
    })
});

export default router;


