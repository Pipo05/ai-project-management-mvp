require('dotenv').config({ path: '../.env' }); // Adjust the path to point to the root directory
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch((err) => console.error('Database connection failed:', err));

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from the frontend
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Tasks API route (GET with PostgreSQL)
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY due_date, priority');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Tasks API route (POST with PostgreSQL)
app.post('/api/tasks', async (req, res) => {
    const { title, priority, deadline } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
            [title, priority, deadline]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Tasks API route (Warnings for tasks near deadlines)
app.get('/api/tasks/warnings', async (req, res) => {
    try {
        const now = new Date();
        const result = await pool.query(
            `SELECT * FROM tasks WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '2 days'`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching warnings:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Tasks API route (Recommendations for extensions)
app.get('/api/tasks/recommendations', async (req, res) => {
    try {
        const now = new Date();
        const result = await pool.query(
            `SELECT id, title, due_date AS "currentDeadline",
            (due_date + INTERVAL '7 days') AS "suggestedDeadline"
            FROM tasks WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recommendations:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        console.error('Error during signup:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user || !bcrypt.compareSync(password, user.password)) {
            console.log('Invalid login attempt:', { username });
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
        console.log('User logged in:', { username });
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Testimonial APIs
// Submit a testimonial
app.post('/api/testimonials', (req, res) => {
    const { name, role, message } = req.body;
    console.log('Testimonial Submission Received:', req.body);
    if (!name || !message || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const newTestimonial = { id: testimonials.length + 1, name, role, message, approved: false };
    testimonials.push(newTestimonial);
    console.log('Current Testimonials:', testimonials); // Log after adding
    res.status(201).json({ message: 'Testimonial submitted for approval.' });
});

// Admin approval endpoint
app.patch('/api/testimonials/:id/approve', (req, res) => {
    const testimonial = testimonials.find(t => t.id === parseInt(req.params.id));
    if (!testimonial) {
        return res.status(404).json({ message: 'Testimonial not found.' });
    }
    testimonial.approved = true;
    res.json({ message: 'Testimonial approved.', testimonial });
});

// Retrieve testimonials
app.get('/api/testimonials', (req, res) => {
    const isAdmin = req.query.admin === 'true'; // Check for admin mode
    if (isAdmin) {
        res.json(testimonials); // Return all testimonials (pending and approved)
    } else {
        const approvedTestimonials = testimonials.filter(t => t.approved);
        res.json(approvedTestimonials); // Return only approved testimonials
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
