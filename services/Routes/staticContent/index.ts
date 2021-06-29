import express, { Router } from "express";

const router = Router();
router.use(express.static("static"));

export default router;
