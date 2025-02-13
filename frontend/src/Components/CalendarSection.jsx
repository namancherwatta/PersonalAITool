import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CalendarSection = ({ googleToken, dummyEvents }) => {
  console.log(googleToken)
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    start: '',
    end: '',
    attendees: '', 
  });

  useEffect(() => {
    if (googleToken) {
      fetchEvents();
    }
  }, [googleToken]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4001/events', {
        headers: { Authorization: googleToken },
      });
      console.log(response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!googleToken) {
      alert('Google token missing. Please login.');
      return;
    }

    const attendeesArray = formData.attendees
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email !== '');

    try {
      const response = await axios.post('http://localhost:4001/create-event', {
        accessToken: googleToken,
        summary: formData.summary,
        description: formData.description,
        startTime: formData.start, 
        endTime: formData.end, 
        attendees: attendeesArray,
      });

      alert('Event created successfully!');
      setFormData({ summary: '', description: '', start: '', end: '', attendees: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };


  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white shadow-md rounded p-4 text-sm w-full">
      <h2 className="text-lg font-semibold mb-2">Calendar Section</h2>

      {googleToken ? (
        <>
          
          <div className="overflow-y-auto h-60 border p-2 rounded">
            {loading ? (
              <p className="text-gray-500">Loading events...</p>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="border-b p-2">
                  <p className="font-semibold">{event.summary}</p>
                  <p className="text-xs text-gray-600">
                    {event.start?.dateTime} - {event.end?.dateTime}
                  </p>
                  <p className="text-xs text-gray-500">{event.description}</p>
                  {event.attendees && (
                    <p className="text-xs text-gray-700">
                      Attendees: {event.attendees.map((a) => a.email).join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events found.</p>
            )}

            {!googleToken &&
              dummyEvents.map((event, index) => (
                <div key={index} className="border-b p-2">
                  <p className="font-semibold">{event.summary}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>

          <form onSubmit={handleCreateEvent} className="mb-4">
            <input
              type="text"
              name="summary"
              placeholder="Event Title"
              value={formData.summary}
              onChange={handleChange}
              className="border rounded p-2 mr-2"
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border rounded p-2 mr-2"
            />
            <input
              type="datetime-local"
              name="start"
              value={formData.start}
              onChange={handleChange}
              className="border rounded p-2 mr-2"
              required
            />
            <input
              type="datetime-local"
              name="end"
              value={formData.end}
              onChange={handleChange}
              className="border rounded p-2 mr-2"
              required
            />
            <input
              type="text"
              name="attendees"
              placeholder="Attendees (comma-separated emails)"
              value={formData.attendees}
              onChange={handleChange}
              className="border rounded p-2 mr-2"
            />
            <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded">
              Create Event
            </button>
          </form>
        </>
      ) : (
        <div className="overflow-y-auto h-60 border p-2 rounded">
        {dummyEvents && dummyEvents.length > 0 ? (
          dummyEvents.map((event, index) => (
            <div key={index} className="border-b p-2">
              <p className="font-semibold">{event.summary}</p>
              <p className="text-xs text-gray-600">
                {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{event.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No dummy events available.</p>
        )}
      </div>
      )}
    </div>
  );
};

export default CalendarSection;
