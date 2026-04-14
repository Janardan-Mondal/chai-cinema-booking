import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const { pool } = await import("../db/db.js");

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        //check if user exists in database
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length > 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        //hashed password 
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert user into database
        await pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, [name, email, hashedPassword]);


        //redirect to login page
        res.status(200).redirect("/login");
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred during login",
            error: error.message
        });
    }
}

//login function
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        //check if user exists in database
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).redirect("/login?error=Invalid email or password");
        }

        const user = userResult.rows[0];

        //compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).redirect("/login?error=Invalid email or password");
        }

        //generate jwttoken for user authentication
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        //set token in cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // Adjust as needed (e.g., "strict" or "none" if cross-site)
            maxAge: 60 * 60 * 1000 // 1 hour
        })

        //respond with success
        res.redirect("/auth/me");

    } catch (error) {
        res.status(500).redirect("/login?error=An error occurred during login");
    }
}

//me function
export const me = async (req, res) => {
    try {
        const userId = req.userId;
        const userResult = await pool.query("SELECT id,name, email FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length <= 0) {
            return res.status(404).redirect("404");
        }

        const user = userResult.rows[0];

        res.status(200).render("dashboard", {
            user
        });
    } catch (error) {
        res.status(500).redirect("/login?error=An error occurred while fetching user data");
    }
}




//logout function
export const logout = (req, res) => {
    // Clear the token from the client side by clearing the cookie
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    res.status(200).redirect("/login");
}