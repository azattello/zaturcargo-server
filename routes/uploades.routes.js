const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User');

// Конфигурация multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/'); // Папка для сохранения изображений
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});
const upload = multer({ storage: storage });

// Маршрут для загрузки фото профиля
router.post('/profile-image', upload.single('profileImage'), async (req, res) => {
    try {
        const { phone } = req.body;
        const profileImage = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        // Находим пользователя по номеру телефона и обновляем поле profilePhoto
        const user = await User.findOneAndUpdate(
            { phone: phone },
            { profilePhoto: profileImage },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({ imageUrl: profileImage });
    } catch (error) {
        console.error('Error uploading profile image:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
