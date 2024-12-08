import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/components/Dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch all tasks
    axios
      .get('http://localhost:5000/api/tasks')
      .then((response) => setTasks(response.data))
      .catch((error) => console.error('Error fetching tasks:', error));

    // Fetch tasks with warnings
    axios
      .get('http://localhost:5000/api/tasks/warnings')
      .then((response) => setWarnings(response.data))
      .catch((error) => console.error('Error fetching warnings:', error));

    // Fetch deadline recommendations
    axios
      .get('http://localhost:5000/api/tasks/recommendations')
      .then((response) => setRecommendations(response.data))
      .catch((error) => console.error('Error fetching recommendations:', error));
  }, []);

  const groupTasksByDate = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0];
    const upcoming = tasks.filter((task) => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return (
        taskDate === today ||
        taskDate === tomorrow ||
        new Date(task.deadline) < new Date(now.setDate(now.getDate() + 7))
      );
    });

    return {
      today: upcoming.filter((task) => new Date(task.deadline).toISOString().split('T')[0] === today),
      tomorrow: upcoming.filter((task) => new Date(task.deadline).toISOString().split('T')[0] === tomorrow),
      withinWeek: upcoming.filter((task) => new Date(task.deadline) > new Date(tomorrow)),
    };
  };

  const { today, tomorrow, withinWeek } = groupTasksByDate();

  const priorityClass = (priority) => {
    if (priority <= 2) return 'high-priority';
    if (priority <= 4) return 'medium-priority';
    return 'low-priority';
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <section className="deadlines-section">
        <h2 className="section-title">Upcoming Deadlines</h2>
        <div>
          <h3>Today</h3>
          <ul className="task-list">
            {today.length > 0 ? (
              today.map((task) => (
                <li key={task.id} className={`task-item ${priorityClass(task.priority)}`}>
                  <h4>{task.title || 'Untitled Task'}</h4>
                  <p>Priority: {task.priority || 'N/A'}</p>
                  <p>Deadline: {task.deadline || 'No deadline provided'}</p>
                </li>
              ))
            ) : (
              <p>No tasks for today.</p>
            )}
          </ul>
        </div>
        <div>
          <h3>Tomorrow</h3>
          <ul className="task-list">
            {tomorrow.length > 0 ? (
              tomorrow.map((task) => (
                <li key={task.id} className={`task-item ${priorityClass(task.priority)}`}>
                  <h4>{task.title || 'Untitled Task'}</h4>
                  <p>Priority: {task.priority || 'N/A'}</p>
                  <p>Deadline: {task.deadline || 'No deadline provided'}</p>
                </li>
              ))
            ) : (
              <p>No tasks for tomorrow.</p>
            )}
          </ul>
        </div>
        <div>
          <h3>Within the Next 7 Days</h3>
          <ul className="task-list">
            {withinWeek.length > 0 ? (
              withinWeek.map((task) => (
                <li key={task.id} className={`task-item ${priorityClass(task.priority)}`}>
                  <h4>{task.title || 'Untitled Task'}</h4>
                  <p>Priority: {task.priority || 'N/A'}</p>
                  <p>Deadline: {task.deadline || 'No deadline provided'}</p>
                </li>
              ))
            ) : (
              <p>No tasks within the next 7 days.</p>
            )}
          </ul>
        </div>
      </section>

      <section className="recommendations-section">
        <h2 className="section-title">Deadline Recommendations</h2>
        <ul className="recommendations-list">
          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <li key={rec.id} className="recommendation-item">
                <h4>{rec.title || 'Untitled Task'}</h4>
                <p>Current Deadline: {rec.currentDeadline || 'N/A'}</p>
                <p>Suggested Deadline: {rec.suggestedDeadline || 'N/A'}</p>
              </li>
            ))
          ) : (
            <p>No recommendations at this time.</p>
          )}
        </ul>
      </section>

      <section className="all-tasks-section">
        <h2 className="section-title">All Tasks</h2>
        <ul className="task-list">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className={`task-item ${priorityClass(task.priority)}`}>
                <h4>{task.title || 'Untitled Task'}</h4>
                <p>Priority: {task.priority || 'N/A'}</p>
                <p>Deadline: {task.deadline || 'No deadline provided'}</p>
              </li>
            ))
          ) : (
            <p>No tasks available.</p>
          )}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
