const express = require("express");
const mongoose = require("mongoose");
const fs = require('fs');
const config = require("config");
const authRouter = require("./routes/auth.routes");
const statusRouter = require("./routes/status.routes");
const filialRouter = require("./routes/filial.routes");
const trackRouter = require("./routes/track.routes");
const userRouter = require("./routes/user.routes");
const bookmarkRouter = require("./routes/bookmark.routes");
const archiveRouter = require("./routes/archive.routes");
const settingsRouter = require('./routes/settings.routes');
const lostRouter = require('./routes/lost.routes');
const uploadesRouter = require('./routes/uploades.routes');
const corsMiddleware = require('./middleware/cors.middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || config.get('serverPort');

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Проверяем, существует ли папка uploads, и создаем её при необходимости
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Маршруты
app.use('/api/auth', authRouter);
app.use('/api/status', statusRouter);
app.use('/api/filial', filialRouter);
app.use('/api/track', trackRouter);
app.use('/api/user', userRouter);
app.use('/api/bookmark', bookmarkRouter);
app.use('/api/archive', archiveRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/losts', lostRouter);
app.use('/api/upload', uploadesRouter);

// Запуск сервера
// const start = async () => {
//     try {
//         await mongoose.connect(config.get('dbUrl'));
//         app.listen(PORT, () => {
//             console.log("Server started on the port ", PORT);
//         });
//     } catch (error) {
//         console.log(error);
//     }
// };



// HTTPS options
const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/zaturcargo.kz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/zaturcargo.kz/fullchain.pem')
};

const start = async () => {
    try {
        await mongoose.connect(config.get('dbUrl'));
        
        // Create HTTPS server
        https.createServer(httpsOptions, app).listen(PORT, () => {
            console.log("Server started on the port ", PORT);
        });
        
    } catch (error) {
        console.log(error);
    }
}
start();