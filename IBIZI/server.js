const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Настройки подключения к базе данных
const pool = new Pool({
    user: 'my_user',
    host: 'localhost',
    database: 'my_database',
    password: 'my_password',
    port: 5432,
});

// Middleware для обработки данных из формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Статические файлы
app.use(express.static('public'));

// Создание таблицы, если ее нет
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table "users" is ready.');
    }
});

// Обработка формы
app.post('/submit', async (req, res) => {
    const { name, email } = req.body;

    try {
        await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
        res.redirect('/list');
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Server Error');
    }
});

// Отдача сохраненных данных
app.get('/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, email FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Server Error');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
