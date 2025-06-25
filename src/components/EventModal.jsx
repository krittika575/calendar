// src/components/EventModal.jsx
import React from 'react';

function EventModal({ event, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>{event.title}</h1>
        <p>{event.description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default EventModal;
