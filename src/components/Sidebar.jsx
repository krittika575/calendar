// src/components/Sidebar.jsx
import React from 'react';

function Sidebar({ onAddEventClick, onHomeClick, className, events = [] }) {
  // Calculate stats
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const thisMonthEvents = events.filter(event => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  }).length;

  return (
    <aside className={`sidebar ${className || ''}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <div className="logo-icon">T</div>
          <span className="app-name">Tymr</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li 
            onClick={onHomeClick} 
            className="nav-item active"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onHomeClick();
              }
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            <span>Dashboard</span>
          </li>
          <li 
            onClick={onAddEventClick} 
            className="nav-item primary"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAddEventClick();
              }
            }}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ New Event</span>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        {/* Stats Card */}
        <div className="stats-card">
          <div className="stats-header">
            <svg className="stats-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="stats-title">This Month</span>
          </div>
          <div className="stats-value">{thisMonthEvents} Events</div>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" 
              alt="User Avatar" 
              className="avatar-image"
            />
            <div className="avatar-status"></div>
          </div>
          <div className="user-info">
            <div className="user-name">John Doe</div>
            <div className="user-email">john.doe@company.com</div>
          </div>
          <button className="profile-menu-btn" aria-label="Profile Menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
