import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import SearchBar from './components/SearchBar';
import './styles/styles.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 5, 25)); // June 25, 2025
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleSearch = (query, filters) => {
    setSearchActive(!!query || Object.values(filters).some(f => f !== 'all' && f !== ''));
  };

  const handleAddEvent = (newEvent) => {
    if (selectedEvent) {
      // Handle recurring events
      if (selectedEvent.isRecurring && newEvent.recurringType !== 'none') {
        // For now, update the single event. In a real app, you'd ask user:
        // "Do you want to edit this event only or all events in the series?"
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...selectedEvent, ...newEvent }
            : event
        ));
      } else {
        // Update existing event
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...selectedEvent, ...newEvent }
            : event
        ));
      }
    } else {
      // Add new event with recurring logic
      const baseEvent = {
        ...newEvent,
        id: Date.now(),
        date: newEvent.date || selectedDate.toISOString().split('T')[0]
      };

      if (newEvent.isRecurring && newEvent.recurringType !== 'none') {
        // Generate recurring events
        const recurringEvents = generateRecurringEvents(baseEvent);
        setEvents([...events, ...recurringEvents]);
      } else {
        setEvents([...events, baseEvent]);
      }
    }
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const generateRecurringEvents = (baseEvent) => {
    const events = [baseEvent];
    const startDate = new Date(baseEvent.date);
    const endDate = baseEvent.recurringEnd ? new Date(baseEvent.recurringEnd) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    
    let currentDate = new Date(startDate);
    let eventId = baseEvent.id;

    while (currentDate <= endDate) {
      switch (baseEvent.recurringType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          return events;
      }

      if (currentDate <= endDate) {
        events.push({
          ...baseEvent,
          id: ++eventId,
          date: currentDate.toISOString().split('T')[0],
          recurringParentId: baseEvent.id
        });
      }
    }

    return events;
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <Sidebar
        className={sidebarOpen ? 'open' : ''}
        events={events}
        onAddEventClick={() => {
          setShowEventForm(true);
          setSidebarOpen(false);
        }}
        onHomeClick={() => {
          setSidebarOpen(false);
        }}
      />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 20,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}
      
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">Calendar Dashboard</h1>
            <p className="page-subtitle">Manage your schedule efficiently</p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-section">
          <SearchBar
            events={events}
            onFilteredEvents={setFilteredEvents}
            onSearch={handleSearch}
          />
        </div>
        
        <Calendar
          selectedDate={selectedDate}
          events={events}
          filteredEvents={searchActive ? filteredEvents : null}
          onDateSelect={handleDateSelect}
          onEventClick={handleEditEvent}
          onCreateEvent={handleCreateEvent}
        />
      </main>
      
      {/* Event Form Modal */}
      {showEventForm && (
        <div className="modal-overlay" onClick={() => {
          setShowEventForm(false);
          setSelectedEvent(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EventForm
              event={selectedEvent}
              selectedDate={selectedDate}
              events={events}
              onSubmit={handleAddEvent}
              onClose={() => {
                setShowEventForm(false);
                setSelectedEvent(null);
              }}
              onDelete={selectedEvent ? handleDeleteEvent : null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;