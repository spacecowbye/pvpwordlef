import express from "express";
import { ok } from "node:assert";

const router = express.Router();


router.get(`/duel/:room`,(req,res) => {
    res.status(200).json({
        "status" : "ok",
    })
});

export default router;


