import React, { useState, useEffect } from 'react';

export default function TimePicker({ value, onChange }) {
  const parseTime = (timeStr) => {
    if (!timeStr) {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const period = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return { hour: String(h).padStart(2, '0'), minute: m, period };
    }
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      return { hour: String(match[1]).padStart(2, '0'), minute: match[2], period: match[3].toUpperCase() };
    }
    return { hour: '12', minute: '00', period: 'PM' };
  };

  const [timeState, setTimeState] = useState(() => parseTime(value));

  useEffect(() => {
    if (value) {
      setTimeState(parseTime(value));
    }
  }, [value]);

  const updateTime = (newHour, newMinute, newPeriod) => {
    const updated = { hour: newHour, minute: newMinute, period: newPeriod };
    setTimeState(updated);
    if (onChange) {
      onChange(`${updated.hour}:${updated.minute} ${updated.period}`);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ffffff, #f0f4fb)',
        border: '1px solid #4286f4',
        borderRadius: '4px',
        padding: '2px 5px',
        boxShadow: '0 1px 3px rgba(66, 134, 244, 0.15)',
        gap: '3px',
        fontFamily: "'Times New Roman', Times, serif"
      }}
    >
      <select
        value={timeState.hour}
        onChange={(e) => updateTime(e.target.value, timeState.minute, timeState.period)}
        style={{
          border: '1px solid #767676',
          borderRadius: '2px',
          padding: '2px 4px',
          fontSize: '13px',
          fontWeight: 'bold',
          backgroundColor: '#ffffff',
          color: '#1a365d',
          cursor: 'pointer'
        }}
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span style={{ fontWeight: 'bold', color: '#4286f4', fontSize: '14px' }}>:</span>
      <select
        value={timeState.minute}
        onChange={(e) => updateTime(timeState.hour, e.target.value, timeState.period)}
        style={{
          border: '1px solid #767676',
          borderRadius: '2px',
          padding: '2px 4px',
          fontSize: '13px',
          fontWeight: 'bold',
          backgroundColor: '#ffffff',
          color: '#1a365d',
          cursor: 'pointer'
        }}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => updateTime(timeState.hour, timeState.minute, timeState.period === 'AM' ? 'PM' : 'AM')}
        style={{
          backgroundColor: timeState.period === 'AM' ? '#ff9800' : '#4286f4',
          color: '#ffffff',
          border: 'none',
          borderRadius: '3px',
          padding: '2px 6px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          marginLeft: '2px'
        }}
      >
        {timeState.period}
      </button>
    </div>
  );
}
