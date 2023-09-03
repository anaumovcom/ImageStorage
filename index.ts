require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({limit: '50mb'})); // Увеличиваем лимит для json тела запроса

// Создания каталога для картинок
const imagesDir = path.join(__dirname, '/images/');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// API для проверки работоспособности сервера
app.get('/', (req, res) => {
    res.json({message: 'Server is working'});
});

// API для загрузки картинки в формате base64
app.post('/upload', (req, res) => {
    const { taskId, imageBase64, token } = req.body;

    if (token !== process.env.TOKEN) {
        return res.status(400).json({error: 'Incorrect token'});
    }

    if (!imageBase64) {
        return res.status(400).json({error: 'No image data provided'});
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const imagePath = path.join(__dirname, `/images/${taskId}.png`);

    fs.writeFile(imagePath, buffer, (err) => {
        if (err) {
            return res.status(500).json({error: 'Failed to save image'});
        }
        res.json({message: 'Image uploaded successfully', taskId: `${taskId}`});
    });
});

// API для отображения картинки
app.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, '/images/', imageName);

    fs.exists(imagePath, (exists) => {
        if (!exists) {
            return res.status(404).json({error: 'Image not found'});
        }
        res.sendFile(imagePath);
    });
});

// Запускаем сервер на порту 3000
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
