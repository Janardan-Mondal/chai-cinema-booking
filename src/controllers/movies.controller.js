// movies controller
import fs from "fs";
import { pool } from "../db/db.js";
import { formattedDate } from "../assets/date.js";


// read JSON file
const movies = JSON.parse(
    fs.readFileSync("./src/assets/movies.json")
);

export const movie = async (req, res) => {
    // movie information
    const movieId = req.params.id;
    const movie = movies.find((m) => m.id === parseInt(movieId));
    if (!movie) {
        return res.status(404).render("404");
    }
    // seats from DB
    const result = await pool.query(`
    SELECT 
    s.id,
    s.seat_number,
    CASE 
        WHEN b.seat_id IS NOT NULL THEN true
        ELSE false
        END AS is_booked
    FROM seats s
    LEFT JOIN bookings b
    ON s.id = b.seat_id
    AND b.movie_id = $1
    AND b.show_date = $2
    ORDER BY s.id;
    `, [movieId, `${formattedDate}`]);

    // console.log(result.rows);
    res.status(200).render("tickets", { movie, seats: result.rows, formattedDate });
}

export const bookingProccess = async (req, res) => {
    const conn = await pool.connect(); // pick a connection from the pool
    try {
        const user_id = req.userId;
        const { seat_id, movie_id, show_date } = req.body;
        // console.log(seat_id, movie_id, show_date, user_id);
        await conn.query("BEGIN");

        // check if the seat is already booked for the movie and show date
        const checkBooking = await conn.query(`
            SELECT * FROM bookings 
            WHERE seat_id = $1 AND movie_id = $2 AND show_date = $3 FOR UPDATE
        `, [seat_id, movie_id, show_date]);

        if (checkBooking.rows.length > 0) {
            await conn.query("ROLLBACK");
            return res.status(400).json({ success: false, message: "Seat already booked for this movie and show date." });
        }

        // insert booking into database and set is_booked to true for the seat which is fk for bookings table
        await conn.query(`
            INSERT INTO bookings (user_id, seat_id, movie_id, show_date) 
            VALUES ($1, $2, $3, $4)
        `, [user_id, seat_id, movie_id, show_date]);


        await conn.query("COMMIT");

        return res.status(200).json({ success: true, message: "Booking successful." });
    } catch (err) {
        await conn.query("ROLLBACK");
        console.error(err);
        res.send("Error");
    } finally {
        conn.release(); // release the connection back to the pool
    }
};