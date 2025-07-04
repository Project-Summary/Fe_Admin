import React from 'react';

const DateFilter = ({ filters, handleFilterChange }: any) => {
  return (
    <div>
      <label htmlFor="joinedAfter">Joined After:</label>
      <input
        type="date"
        id="joinedAfter"
        name="joinedAfter"
        value={filters.joinedAfter ? new Date(filters.joinedAfter).toISOString().split('T')[0] : ''}
        onChange={(e) => {
          handleFilterChange("joinedAfter", e.target.value || "");
        }}
      />
    </div>
  );
};

export default DateFilter;
