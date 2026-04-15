import e from "express";
import cookieParser from "cookie-parser";
import router from "./routers/router.js";
import fs from "fs"
import path from "path";
import { authenticateToken } from "./utils/auth.middleware.js";
import { movie } from "./controllers/movies.controller.js";

const app = e();

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "ejs");

app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(cookieParser());

// read JSON file
const movies = JSON.parse(
    fs.readFileSync(
        path.join(process.cwd(), "src/assets/movies.json"),
        "utf-8"
    )
);


app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/login", (req, res) => {
    res.render("login");
});

//movies route
app.get("/movies", authenticateToken, (req, res) => {
    res.status(200).render("movies", { movies });
});

// ticket booking route
app.get("/movies/:id/booking", authenticateToken, movie);

app.use("/auth", router);

app.all("{*path}", (req, res) => {
    res.status(404).render("404");
});


export default app;