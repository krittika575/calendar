import React, { useState, useEffect } from 'react';

function SearchBar({ events, onFilteredEvents, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    dateRange: 'all',
    tags: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter and search events
  useEffect(() => {
    let filtered = events;

    // Search by title, description, location
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.tags?.toLowerCase().includes(query)
      );
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(event => event.priority === filters.priority);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        
        switch (filters.dateRange) {
          case 'today':
            return eventDate.toDateString() === today.toDateString();
          case 'thisWeek':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return eventDate >= weekStart && eventDate <= weekEnd;
          case 'thisMonth':
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
          case 'upcoming':
            return eventDate >= today;
          case 'past':
            return eventDate < today;
          default:
            return true;
        }
      });
    }

    // Filter by tags
    if (filters.tags.trim()) {
      const tagQuery = filters.tags.toLowerCase();
      filtered = filtered.filter(event =>
        event.tags?.toLowerCase().includes(tagQuery)
      );
    }

    onFilteredEvents(filtered);
    onSearch(searchQuery, filters);
  }, [searchQuery, filters, events, onFilteredEvents, onSearch]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      priority: 'all',
      dateRange: 'all',
      tags: ''
    });
  };

  const hasActiveFilters = searchQuery || 
    filters.priority !== 'all' || 
    filters.dateRange !== 'all' || 
    filters.tags;

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        
        <button
          className={`filter-toggle-btn ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
          </svg>
          {hasActiveFilters && <div className="filter-indicator"></div>}
        </button>
      </div>

      {isExpanded && (
        <div className="search-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Priority</label>
              <select
                className="filter-select"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <select
                className="filter-select"
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Tags</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Filter by tags..."
                value={filters.tags}
                onChange={(e) => setFilters({...filters, tags: e.target.value})}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={handleClearFilters}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2h4"></path>
                </svg>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
