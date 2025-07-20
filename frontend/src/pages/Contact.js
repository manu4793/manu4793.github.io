import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import '../App.css'; // Assuming global styles are here, like in Home.js

export default function Contact() {
  const form = useRef();
  const [status, setStatus] = useState(null); // State to manage success/error messages

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus(null); // Reset status before sending

    emailjs.sendForm(
      'service_v34k0gy',      // Your Service ID from the dashboard
      'template_md0mjvc',     // Replace with your actual Template ID (e.g., 'template_abc123')
      form.current,
      { publicKey: 'rFRtJM6A5XLBURvyQ' }  // Replace with your actual Public Key (e.g., 'abcdef123456')
    )
      .then((result) => {
        console.log('Success:', result.text);
        setStatus('success'); // Set success status
        form.current.reset(); // Clear the form after success
      }, (error) => {
        console.log('Error details:', error);
        setStatus('error'); // Set error status
      });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      background: "none",
      padding: "20px"
    }}>
      <div className="card mx-auto shadow" style={{
        maxWidth: "500px",
        width: "100%",
        borderRadius: "10px",
        border: "1px solid #ddd",
        padding: "20px"
      }}>
        <div className="card-body">
          <h1 style={{
            fontSize: "2.2rem",
            fontWeight: "bold",
            marginBottom: "10px",
            textAlign: "center",
            color: "#333"
          }}>
            Contact Me
          </h1>
          <p style={{
            fontSize: "1.1rem",
            color: "#555",
            textAlign: "center",
            marginBottom: "25px"
          }}>
            Feel free to reach out with any questions or opportunities!
          </p>
          <form ref={form} onSubmit={sendEmail}>
            <div className="mb-3">
              <label htmlFor="user_name" className="form-label" style={{ fontWeight: "600", color: "#444" }}>Name</label>
              <input type="text" name="user_name" id="user_name" className="form-control" required />
            </div>
            <div className="mb-3">
              <label htmlFor="user_email" className="form-label" style={{ fontWeight: "600", color: "#444" }}>Email</label>
              <input type="email" name="user_email" id="user_email" className="form-control" required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label" style={{ fontWeight: "600", color: "#444" }}>Message</label>
              <textarea name="message" id="message" className="form-control" rows="5" required />
            </div>
            <button type="submit" className="btn btn-primary w-100" style={{
              padding: "12px",
              borderRadius: "24px",
              fontWeight: "600",
              fontSize: "1.08rem"
            }}>
              Send Message
            </button>
          </form>
          {status === 'success' && (
            <div className="alert alert-success mt-3" role="alert">
              Message sent successfully!
            </div>
          )}
          {status === 'error' && (
            <div className="alert alert-danger mt-3" role="alert">
              Failed to send message. Invalid email address.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}