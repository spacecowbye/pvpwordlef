import express from "express";

const router = express.Router();


router.get(`/game/:room`,() => {
    console.log("Game is started");
});

export default router;


