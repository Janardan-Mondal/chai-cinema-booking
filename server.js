import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.log(`Error starting server: ${error.message}`);
    process.exit(1);
});