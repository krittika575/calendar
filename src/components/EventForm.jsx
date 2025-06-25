// src/components/EventForm.jsx
import React, { useState, useEffect } from 'react';

function EventForm({ event, selectedDate, events = [], onSubmit, onClose, onDelete }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    tags: event?.tags || '',
    priority: event?.priority || 'medium',
    timezone: event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    isRecurring: event?.isRecurring || false,
    recurringType: event?.recurringType || 'none',
    recurringEnd: event?.recurringEnd || '',
    date: event?.date || (selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '10:00',
    duration: event?.duration || 60
  });

  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFormat, setTimeFormat] = useState('24h'); // 12h or 24h
  const [suggestions, setSuggestions] = useState([]);
  const [pastDateWarning, setPastDateWarning] = useState(false);

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: '#10b981', icon: '↓' },
    { value: 'medium', label: 'Medium Priority', color: '#f59e0b', icon: '→' },
    { value: 'high', label: 'High Priority', color: '#ef4444', icon: '↑' }
  ];

  // Recurring options
  const recurringOptions = [
    { value: 'none', label: 'No Repeat' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  // Generate time slots for dropdowns
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        let time12 = time24;
        
        if (timeFormat === '12h') {
          const [h, m] = time24.split(':');
          const hour12 = parseInt(h) === 0 ? 12 : parseInt(h) > 12 ? parseInt(h) - 12 : parseInt(h);
          const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
          time12 = `${hour12}:${m} ${ampm}`;
        }
        
        slots.push({ value: time24, label: time12 });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert time to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Check for conflicts with existing events
  const checkConflicts = () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return;

    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);

    const dayEvents = events.filter(evt => 
      evt.date === formData.date && 
      evt.id !== event?.id && // Exclude current event if editing
      evt.startTime && evt.endTime
    );

    const conflictingEvents = dayEvents.filter(evt => {
      const eventStart = timeToMinutes(evt.startTime);
      const eventEnd = timeToMinutes(evt.endTime);
      
      return (
        (startMinutes >= eventStart && startMinutes < eventEnd) ||
        (endMinutes > eventStart && endMinutes <= eventEnd) ||
        (startMinutes <= eventStart && endMinutes >= eventEnd)
      );
    });

    setConflicts(conflictingEvents);
  };

  // Generate time suggestions when conflicts exist
  const generateSuggestions = () => {
    if (conflicts.length === 0) {
      setSuggestions([]);
      return;
    }

    const duration = timeToMinutes(formData.endTime) - timeToMinutes(formData.startTime);
    const dayEvents = events.filter(evt => 
      evt.date === formData.date && 
      evt.id !== event?.id &&
      evt.startTime && evt.endTime
    );

    const occupiedSlots = dayEvents.map(evt => ({
      start: timeToMinutes(evt.startTime),
      end: timeToMinutes(evt.endTime)
    })).sort((a, b) => a.start - b.start);

    const suggestions = [];
    let currentTime = 8 * 60; // Start from 8:00 AM

    for (const slot of occupiedSlots) {
      if (currentTime + duration <= slot.start) {
        suggestions.push({
          start: minutesToTime(currentTime),
          end: minutesToTime(currentTime + duration),
          type: 'before'
        });
        if (suggestions.length >= 3) break;
      }
      currentTime = Math.max(currentTime, slot.end);
    }

    // Add suggestion after last event
    if (suggestions.length < 3 && currentTime + duration <= 20 * 60) { // Until 8 PM
      suggestions.push({
        start: minutesToTime(currentTime),
        end: minutesToTime(currentTime + duration),
        type: 'after'
      });
    }

    setSuggestions(suggestions);
  };

  // Check if selected date/time is in the past
  const checkPastDateTime = () => {
    if (!formData.date || !formData.startTime) return false;
    
    const now = new Date();
    const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);
    
    // Allow editing existing events even if they're in the past
    if (event) return false;
    
    return selectedDateTime < now;
  };

  // Get minimum date (today) for date picker
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum time for today's date
  const getMinTime = () => {
    const today = new Date();
    const selectedDateObj = new Date(formData.date);
    
    // If selected date is today, minimum time is current time + 15 minutes
    if (selectedDateObj.toDateString() === today.toDateString()) {
      const minTime = new Date(today.getTime() + 15 * 60000); // Add 15 minutes
      return `${minTime.getHours().toString().padStart(2, '0')}:${Math.ceil(minTime.getMinutes() / 15) * 15}`.padStart(5, '0');
    }
    
    return '00:00';
  };

  // Validate date and time against past
  const validateDateTime = () => {
    const isPast = checkPastDateTime();
    setPastDateWarning(isPast);
    return !isPast;
  };

  // Auto-correct end time if it's before start time
  const handleTimeChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'startTime' && timeToMinutes(value) >= timeToMinutes(formData.endTime)) {
      // Auto-adjust end time to be 1 hour after start time
      const newEndTime = minutesToTime(timeToMinutes(value) + 60);
      newFormData.endTime = newEndTime;
    }
    
    if (field === 'endTime' && timeToMinutes(value) <= timeToMinutes(formData.startTime)) {
      // Auto-adjust start time to be 1 hour before end time
      const newStartTime = minutesToTime(Math.max(0, timeToMinutes(value) - 60));
      newFormData.startTime = newStartTime;
    }

    setFormData(newFormData);
  };

  // Enhanced date change handler
  const handleDateChange = (newDate) => {
    const today = new Date();
    const selectedDateObj = new Date(newDate);
    
    // If selecting today and current start time is in the past, adjust it
    if (selectedDateObj.toDateString() === today.toDateString()) {
      const minTime = getMinTime();
      if (timeToMinutes(formData.startTime) < timeToMinutes(minTime)) {
        const newStartTime = minTime;
        const newEndTime = minutesToTime(timeToMinutes(newStartTime) + 60);
        setFormData({
          ...formData,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime
        });
        return;
      }
    }
    
    setFormData({ ...formData, date: newDate });
  };

  // Apply suggested time slot
  const applySuggestion = (suggestion) => {
    setFormData({
      ...formData,
      startTime: suggestion.start,
      endTime: suggestion.end
    });
  };

  // Get user's timezone
  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Format timezone display
  const formatTimezone = (timezone) => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    return `${timezone.replace('_', ' ')} (${timeZoneName})`;
  };

  useEffect(() => {
    checkConflicts();
    validateDateTime();
  }, [formData.date, formData.startTime, formData.endTime, events]);

  useEffect(() => {
    generateSuggestions();
  }, [conflicts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(formData);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (event && onDelete && window.confirm('Are you sure you want to delete this event?')) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      onDelete(event.id);
      setIsLoading(false);
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (timeFormat === '12h') {
      const [h, m] = timeStr.split(':');
      const hour12 = parseInt(h) === 0 ? 12 : parseInt(h) > 12 ? parseInt(h) - 12 : parseInt(h);
      const ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${m} ${ampm}`;
    }
    return timeStr;
  };

  const isPastDateTime = checkPastDateTime();
  const hasTimeError = timeToMinutes(formData.endTime) <= timeToMinutes(formData.startTime);
  const hasConflicts = conflicts.length > 0;
  const isTimeValid = !hasTimeError && !hasConflicts && !isPastDateTime;

  return (
    <div className="event-form advanced-form">
      <button className="close-button" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div className="form-header">
        <h3 className="form-title">{event ? 'Edit Event' : 'Create New Event'}</h3>
        <p className="form-subtitle">
          {event ? 'Update your event details' : 'Add a new event to your schedule'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          {/* Event Title */}
          <div className="form-field">
            <label className="field-label" htmlFor="event-title">
              Event Title *
            </label>
            <input
              id="event-title"
              type="text"
              className="form-input"
              placeholder="Enter event title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          {/* Priority Selection */}
          <div className="form-field">
            <label className="field-label">Priority Level</label>
            <div className="priority-options">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`priority-btn ${formData.priority === option.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, priority: option.value })}
                  style={{ '--priority-color': option.color }}
                >
                  <span className="priority-icon">{option.icon}</span>
                  <span className="priority-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker with Past Date Prevention */}
          <div className="form-field">
            <label className="field-label" htmlFor="event-date">
              Date *
            </label>
            <input
              id="event-date"
              type="date"
              className={`form-input ${isPastDateTime ? 'error' : ''}`}
              value={formData.date}
              min={event ? undefined : getMinDate()}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
            {!event && (
              <div className="field-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
                Events can only be scheduled for today or future dates
              </div>
            )}
          </div>

          {/* Time Selection Row */}
          <div className="time-selection-row">
            <div className="time-field-group">
              <div className="form-field time-field">
                <label className="field-label" htmlFor="start-time">
                  Start Time *
                </label>
                <select
                  id="start-time"
                  className={`form-select ${hasTimeError || isPastDateTime ? 'error' : ''}`}
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                  required
                >
                  {timeSlots.map(slot => {
                    const isDisabled = !event && formData.date === getMinDate() && 
                                     timeToMinutes(slot.value) < timeToMinutes(getMinTime());
                    return (
                      <option key={slot.value} value={slot.value} disabled={isDisabled}>
                        {slot.label} {isDisabled ? '(Past)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="time-separator">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </div>

              <div className="form-field time-field">
                <label className="field-label" htmlFor="end-time">
                  End Time *
                </label>
                <select
                  id="end-time"
                  className={`form-select ${hasTimeError || isPastDateTime ? 'error' : ''}`}
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                  required
                >
                  {timeSlots.map(slot => {
                    const isDisabled = !event && formData.date === getMinDate() && 
                                     timeToMinutes(slot.value) <= timeToMinutes(getMinTime());
                    return (
                      <option key={slot.value} value={slot.value} disabled={isDisabled}>
                        {slot.label} {isDisabled ? '(Past)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Time Format Toggle */}
            <div className="time-format-toggle">
              <button
                type="button"
                className={`format-btn ${timeFormat === '12h' ? 'active' : ''}`}
                onClick={() => setTimeFormat('12h')}
              >
                12h
              </button>
              <button
                type="button"
                className={`format-btn ${timeFormat === '24h' ? 'active' : ''}`}
                onClick={() => setTimeFormat('24h')}
              >
                24h
              </button>
            </div>
          </div>

          {/* Timezone Display */}
          <div className="form-field">
            <label className="field-label">Timezone</label>
            <div className="timezone-display">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span>{formatTimezone(formData.timezone)}</span>
              <small className="timezone-note">Auto-detected</small>
            </div>
          </div>

          {/* Recurring Event Options */}
          <div className="form-field">
            <label className="field-label">Repeat</label>
            <select
              className="form-select"
              value={formData.recurringType}
              onChange={(e) => setFormData({ 
                ...formData, 
                recurringType: e.target.value,
                isRecurring: e.target.value !== 'none'
              })}
            >
              {recurringOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring End Date */}
          {formData.isRecurring && formData.recurringType !== 'none' && (
            <div className="form-field">
              <label className="field-label" htmlFor="recurring-end">
                Repeat Until (Optional)
              </label>
              <input
                id="recurring-end"
                type="date"
                className="form-input"
                value={formData.recurringEnd}
                min={formData.date}
                onChange={(e) => setFormData({ ...formData, recurringEnd: e.target.value })}
              />
              <div className="field-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
                </svg>
                Leave blank to repeat indefinitely
              </div>
            </div>
          )}

          {/* Location */}
          <div className="form-field">
            <label className="field-label" htmlFor="event-location">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              className="form-input"
              placeholder="Add location..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="field-label" htmlFor="event-description">
              Description
            </label>
            <textarea
              id="event-description"
              className="form-textarea"
              placeholder="Add event description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          {/* Tags */}
          <div className="form-field">
            <label className="field-label" htmlFor="event-tags">
              Tags
            </label>
            <input
              id="event-tags"
              type="text"
              className="form-input"
              placeholder="meeting, work, personal..."
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>
        </div>
        
        <div className="form-actions">
          {event && onDelete && (
            <button 
              type="button" 
              className="form-button danger"
              onClick={handleDelete}
              disabled={isLoading}
              style={{ marginRight: 'auto' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button type="button" className="form-button secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="form-button primary" 
            disabled={isLoading || !formData.title.trim() || hasTimeError || isPastDateTime}
          >
            {isLoading ? (
              <>
                <svg className="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {event ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                {event ? 'Update Event' : 'Create Event'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;
