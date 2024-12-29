import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components/AdminDashboard.css';

const AdminDashboard = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch all testimonials (pending and approved) for the admin
        axios
            .get('http://localhost:5000/api/testimonials?admin=true') // Add query parameter
            .then((response) => {
                console.log('Fetched Testimonials:', response.data);
                setTestimonials(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Failed to fetch testimonials.');
                setLoading(false);
            });
    }, []);    
    

    const approveTestimonial = (id) => {
        axios
            .patch(`http://localhost:5000/api/testimonials/${id}/approve`)
            .then((response) => {
                // Update the testimonial locally after approval
                setTestimonials((prevTestimonials) =>
                    prevTestimonials.map((t) =>
                        t.id === id ? { ...t, approved: true } : t
                    )
                );
                alert('Testimonial approved successfully!');
            })
            .catch((err) => {
                console.error('Error approving testimonial:', err);
                alert('Failed to approve testimonial.');
            });
    };

    if (loading) return <p>Loading testimonials...</p>;
    if (error) return <p>{error}</p>;

    const pendingTestimonials = testimonials.filter((t) => !t.approved);
    const approvedTestimonials = testimonials.filter((t) => t.approved);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Pending Testimonials</h2>
            <ul>
                {pendingTestimonials.map((testimonial) => (
                    <li key={testimonial.id}>
                        <p>
                            <strong>{testimonial.name}</strong> ({testimonial.role})
                        </p>
                        <p>{testimonial.message}</p>
                        <button
                            onClick={() =>
                                approveTestimonial(testimonial.id)
                            }
                        >
                            Approve
                        </button>
                    </li>
                ))}
            </ul>

            <h2>Approved Testimonials</h2>
            <ul>
                {approvedTestimonials.map((testimonial) => (
                    <li key={testimonial.id}>
                        <p>
                            <strong>{testimonial.name}</strong> ({testimonial.role})
                        </p>
                        <p>{testimonial.message}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
