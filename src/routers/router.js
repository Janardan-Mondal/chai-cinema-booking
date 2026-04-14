import { Router } from "express";
import { signup, login, logout, me } from "../controllers/user.controller.js";
import { authenticateToken } from "../utils/auth.middleware.js";
import { bookingProccess } from "../controllers/movies.controller.js";

const router = Router();

//signin route
router.post("/signup", signup);
//login route
router.post("/login", login);
//me route
router.get("/me", authenticateToken, me);

//booking-proccess route
router.post("/booking-proccess", authenticateToken, bookingProccess)

//logout route
router.post("/logout", logout);

export default router;