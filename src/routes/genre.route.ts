import { Router } from "express";
import { GenreController } from "../controllers/genre.controller";

const genreController = new GenreController();
const router = Router();

router.get("/", genreController.getAllGenres);

export default router;
