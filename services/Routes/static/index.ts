import express, { Router } from "express";

const router = Router();

router.use(express.static('textClassification'))

export default router;