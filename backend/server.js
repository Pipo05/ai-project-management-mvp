const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // Allow requests from the frontend
app.use(express.json());

// Temporary in-memory storage
const tasks = [
    { id: 1, title: 'Task 1', priority: 1, deadline: '2024-12-10' },
    { id: 2, title: 'Task 2', priority: 2, deadline: '2024-12-08' },
    // Remove or fix malformed tasks
];


const users = []; // Temporary user storage

// Default route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Tasks API route (GET with prioritization)
app.get('/api/tasks', (req, res) => {
    const sortedTasks = tasks
        .slice()
        .sort((a, b) => {
            const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
            if (deadlineDiff === 0) {
                return a.priority - b.priority; // Sort by priority if deadlines are equal
            }
            return deadlineDiff; // Otherwise, sort by deadline
        });
    console.log('Sorted tasks:', sortedTasks); // Debugging: Check the sorting logic
    res.json(sortedTasks);
});

// Tasks API route (Warnings for tasks near deadlines)
app.get('/api/tasks/warnings', (req, res) => {
    const now = new Date();
    const warnings = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        const timeDifference = deadline - now;
        return timeDifference > 0 && timeDifference <= 2 * 24 * 60 * 60 * 1000; // Within 2 days
    });
    console.log('Warning tasks:', warnings); // Debugging: Check the warning logic
    res.json(warnings);
});

// Tasks API route (Deadline Adjustment Recommendations - Corrected)
app.get('/api/tasks/recommendations', (req, res) => {
    const now = new Date();
    const recommendations = tasks.map(task => {
        const deadline = new Date(task.deadline);
        const timeDifference = deadline - now;

        // Suggest extension if the task is due within 7 days and priority is high (priority <= 3)
        if (timeDifference <= 7 * 24 * 60 * 60 * 1000 && task.priority <= 3) {
            return {
                id: task.id,
                title: task.title || 'Untitled Task',
                currentDeadline: task.deadline || 'N/A',
                suggestedDeadline: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Extend by 7 days
            };
        }
        return null;
    }).filter(rec => rec !== null);

    console.log('Recommendations:', recommendations); // Debugging: Log recommendations
    res.json(recommendations);
});


// Tasks API route (POST)
app.post('/api/tasks', (req, res) => {
    const { title, priority, deadline } = req.body;

    // Validate title
    if (!title || typeof title !== 'string') {
        console.error('Task creation failed: Invalid or missing title.');
        return res.status(400).json({ message: 'Invalid or missing task title.' });
    }

    // Validate and parse deadline
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime()) || parsedDeadline < new Date()) {
        console.error('Task creation failed: Invalid or past deadline.');
        return res.status(400).json({ message: 'Invalid or past deadline.' });
    }

    // Validate priority
    const parsedPriority = parseInt(priority, 10);
    if (!Number.isInteger(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
        console.error('Task creation failed: Invalid priority.');
        return res.status(400).json({ message: 'Priority must be an integer between 1 and 5.' });
    }

    // Add new task
    const newTask = {
        id: tasks.length + 1, 
        title: title.trim(), // Trim extra spaces
        priority: parsedPriority, 
        deadline: parsedDeadline.toISOString().split('T')[0], // Format deadline as YYYY-MM-DD
    };

    tasks.push(newTask);
    console.log('New task added successfully:', newTask);
    res.status(201).json(newTask); // Respond with the new task
});


// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  console.log('New user registered:', { username }); // Debugging: Log new user
  res.status(201).json({ message: 'User created successfully!' });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    console.log('Invalid login attempt:', { username }); // Debugging: Log failed login
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
  console.log('User logged in:', { username }); // Debugging: Log successful login
  res.json({ token });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
