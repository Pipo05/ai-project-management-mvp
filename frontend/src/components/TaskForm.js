import React, { useState } from 'react';
import axios from 'axios';
import '../styles/components/TaskForm.css';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Ensure priority is converted to a number before sending
    const task = { 
      title, 
      deadline, 
      priority: parseInt(priority, 10) // Convert priority to an integer
    };

    // Basic validation checks before making the request
    if (!task.title || task.title.trim() === '') {
      alert('Task title cannot be empty.');
      return;
    }
    if (isNaN(task.priority) || task.priority < 1 || task.priority > 5) {
      alert('Priority must be a number between 1 and 5.');
      return;
    }
    if (!task.deadline || new Date(task.deadline) < new Date()) {
      alert('Please provide a valid future deadline.');
      return;
    }

    axios
      .post('http://localhost:5000/api/tasks', task)
      .then((response) => {
        console.log('Task added:', response.data);
        alert('Task successfully added!'); // Inform the user of success
        // Clear the form fields after successful submission
        setTitle('');
        setDeadline('');
        setPriority('');
      })
      .catch((error) => {
        console.error('Error adding task:', error);
        alert(
          error.response?.data?.message ||
          'Failed to add task. Please try again.'
        );
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a Task</h2>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <input
        type="number"
        placeholder="Priority (1-5)"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
