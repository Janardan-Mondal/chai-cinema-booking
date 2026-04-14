//middleware to check if the user is authenticated before allowing access to certain routes by header jwt token

import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    //access token from cookies
    const token = req.cookies.token;
    if (!token) {
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: "Invalid token."
        });
    }
}