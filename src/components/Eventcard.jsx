// src/components/EventCard.jsx
import React from 'react';

function EventCard({ event, onEdit }) {
  if (!event) return null;

  return (
    <div className="event-card" onClick={() => onEdit(event)}>
      <div className="event-title">{event.title}</div>
      {event.description && (
        <div className="event-description">{event.description}</div>
      )}
    </div>
  );
}

export default EventCard;
