// src/components/Calendar.jsx
import React, { useEffect, useState } from 'react';
import EventCard from './Eventcard';
import { getCalendarDays, formatDate, isToday, isSameMonth } from '../utils/dateUtils';

function Calendar({ selectedDate, events, onDateSelect, onEventClick, onCreateEvent, filteredEvents }) {
  // Set default to June 2025 as specified
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 25)); // June 25, 2025
  const days = getCalendarDays(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateSelect(today);
  };

  // Get week number for a given date
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Get unique week numbers for the calendar grid
  const getWeekNumbers = () => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(getWeekNumber(days[i]));
    }
    return weeks;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          navigateMonth(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateMonth(1);
          break;
        case 'Home':
          event.preventDefault();
          goToToday();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDate]);

  const monthYearDisplay = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const selectedDateDisplay = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric' 
  });

  const weekNumbers = getWeekNumbers();

  // Handle double-click to create event
  const handleDoubleClick = (day) => {
    if (day < new Date().setHours(0, 0, 0, 0)) return; // Prevent creating events in past
    
    onCreateEvent(day);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b', 
      low: '#10b981'
    };
    return colors[priority] || colors.medium;
  };

  // Use filtered events if provided, otherwise use all events
  const displayEvents = filteredEvents || events;

  return (
    <div className="calendar-section">
      {/* Selected Date Badge */}
      <div className="selected-date-card">
        <svg className="selected-date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="selected-date-text">Selected: {selectedDateDisplay}</span>
      </div>

      <div className="calendar-container">
        <header className="calendar-header">
          <h2 className="calendar-title">{monthYearDisplay}</h2>
          <div className="calendar-controls">
            <button 
              className="calendar-nav-btn" 
              onClick={() => navigateMonth(-1)}
              title="Previous Month"
              aria-label="Previous Month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <button 
              className="calendar-nav-btn today-btn" 
              onClick={goToToday}
              title="Go to Today"
              aria-label="Go to Today"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span className="today-btn-text">Today</span>
            </button>
            <button 
              className="calendar-nav-btn" 
              onClick={() => navigateMonth(1)}
              title="Next Month"
              aria-label="Next Month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        </header>
        
        <div className="calendar-grid-container">
          {/* Week Numbers Column */}
          <div className="week-numbers-column">
            <div className="week-header">
              WK
            </div>
            {weekNumbers.map((weekNum, index) => (
              <div key={index} className="week-number" title={`Week ${weekNum}`}>
                {weekNum}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {dayNames.map(dayName => (
              <div key={dayName} className="weekday-header">
                {dayName}
              </div>
            ))}
            
            {days.map((day, index) => {
              const dayEvents = displayEvents.filter(event => 
                event.date && new Date(event.date).toDateString() === day.toDateString()
              );
              
              const eventCount = dayEvents.length;
              const isSelected = day.toDateString() === selectedDate.toDateString();
              const dayKey = `${day.getTime()}-${index}`;
              const isPastDate = day < new Date().setHours(0, 0, 0, 0);
              
              return (
                <div 
                  key={dayKey}
                  className={`calendar-day ${
                    isToday(day) ? 'today' : ''
                  } ${
                    !isSameMonth(day, currentDate) ? 'other-month' : ''
                  } ${
                    isSelected ? 'selected' : ''
                  } ${
                    isPastDate ? 'past-date' : ''
                  }`}
                  onClick={() => {
                    if (!isPastDate) {
                      onDateSelect(day);
                    }
                  }}
                  onDoubleClick={() => handleDoubleClick(day)}
                  role="gridcell"
                  tabIndex={isPastDate ? -1 : 0}
                  aria-label={`${day.toLocaleDateString()}, ${eventCount} events${isPastDate ? ', past date' : ''}`}
                  onKeyDown={(e) => {
                    if (!isPastDate && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onDateSelect(day);
                    }
                  }}
                >
                  <div className="day-header">
                    <span className="day-number">{formatDate(day)}</span>
                    {eventCount > 0 && (
                      <div className="priority-indicators">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <div
                            key={idx}
                            className="priority-dot"
                            style={{ backgroundColor: getPriorityColor(event.priority) }}
                            title={`${event.title} - ${event.priority} priority`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="day-content">
                    {eventCount > 0 && (
                      <>
                        <div className="events-summary">
                          <span className="events-count">
                            {eventCount} {eventCount === 1 ? 'event' : 'events'}
                          </span>
                        </div>
                        <div className="events-preview">
                          {dayEvents.slice(0, 2).map((event) => (
                            <EventCard 
                              key={event.id} 
                              event={event} 
                              onEdit={onEventClick}
                              priority={event.priority}
                            />
                          ))}
                          {eventCount > 2 && (
                            <div className="more-events">
                              +{eventCount - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isPastDate && (
                    <div className="past-date-tooltip">
                      Cannot schedule events in the past
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
