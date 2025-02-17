import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HealthBar = ({ user, dummyHealthData }) => {
  const [healthRecords, setHealthRecords] = useState([]);
  const [doctorVisits, setDoctorVisits] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    bloodPressure: '',
    heartRate: '',
    sugarLevel: '',
  });
  const [visitFormData, setVisitFormData] = useState({
    visitDate: '',
    reason: '',
    doctorName: '',
    prescription: '',
  });
  
  const [showForm, setShowForm] = useState(false);
  const [showDeleteList, setShowDeleteList] = useState(false); 
  const [deleteRecordId, setDeleteRecordId] = useState(null); 
  const [showDeleteVisitList, setShowDeleteVisitList] = useState(false); 
  const [deleteVisitId, setDeleteVisitId] = useState(null);
  const [showVisitForm, setShowVisitForm] = useState(false); 

  useEffect(() => {
    if (user) {
      axios
        .get('http://localhost:4001/health', { headers: { Authorization: user.token } })
        .then((response) => {
          setHealthRecords(cleanHealthData(response.data.records));
          setDoctorVisits(response.data.visits);
        })
        .catch((error) => console.error('Error fetching health data:', error));
    } else {
      setHealthRecords(cleanHealthData(dummyHealthData[0].records));
      setDoctorVisits(dummyHealthData[0].visits);
    }
  }, [user, dummyHealthData]);

  const cleanHealthData = (records) => {
    return records.map((record) => ({
      ...record,
      bloodPressure: parseBloodPressure(record.bloodPressure),
      heartRate: parseFloat(record.heartRate.replace(' bpm', '')),
      sugarLevel: parseFloat(record.sugarLevel.replace(' mg/dL', '')),
    }));
  };

  const parseBloodPressure = (bp) => {
    const [systolic, diastolic] = bp.split('/').map((val) => parseFloat(val));
    return systolic;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    const newRecord = {
      date: formData.date,
      bloodPressure: formData.bloodPressure,
      heartRate: formData.heartRate,
      sugarLevel: formData.sugarLevel,
    };

    if (user) {
      axios
        .post('http://localhost:4001/health/records', newRecord, { headers: { Authorization: user.token } })
        .then((response) => setHealthRecords([...healthRecords, response.data]))
        .catch((error) => console.error('Error adding health record:', error));
    } else {
      setHealthRecords([...healthRecords, newRecord]);
    }

    setShowForm(false); 
  };

  const handleDeleteRecord = (recordId) => {
    if (user) {
      axios
        .delete(`http://localhost:4001/health/records/${recordId}`, { headers: { Authorization: user.token } })
        .then(() => {
          setHealthRecords(healthRecords.filter(record => record.id !== recordId));
          setShowDeleteList(false);
        })
        .catch((error) => console.error('Error deleting health record:', error));
    } else {
      setHealthRecords(healthRecords.filter(record => record.id !== recordId));
      setShowDeleteList(false);
    }
  };

  const handleDeleteVisit = (visitId) => {
    if (user) {
      axios
        .delete(`http://localhost:4001/health/visits/${visitId}`, { headers: { Authorization: user.token } })
        .then(() => {
          setDoctorVisits(doctorVisits.filter(visit => visit.id !== visitId));
          setShowDeleteVisitList(false);
        })
        .catch((error) => console.error('Error deleting doctor visit:', error));
    } else {
      setDoctorVisits(doctorVisits.filter(visit => visit.id !== visitId));
      setShowDeleteVisitList(false);
    }
  };
  
  const handleVisitChange = (e) => {
    setVisitFormData({ ...visitFormData, [e.target.name]: e.target.value });
  };
  
  
  const handleAddVisit = (e) => {
    e.preventDefault();
    const newVisit = {
      date: visitFormData.visitDate,
      reason: visitFormData.reason,
      doctorName: visitFormData.doctorName,
      prescription: visitFormData.prescription.split(',').map((item) => item.trim()),
    };
  
    if (user) {
      axios
        .post('http://localhost:4001/health/visits', newVisit, { headers: { Authorization: user.token } })
        .then((response) => setDoctorVisits([...doctorVisits, response.data]))
        .catch((error) => console.error('Error adding doctor visit:', error));
    } else {
      setDoctorVisits([...doctorVisits, newVisit]);
    }
  
    setShowVisitForm(false);
  };


  return (
    <div className="bg-white p-4 rounded shadow-md w-full">
      <h2 className="text-lg font-semibold mb-4">Health Bar Section</h2>

      {/* Health Records Over Time */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Blood Pressure Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={healthRecords} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="bloodPressure" stroke="#8884d8" name="Blood Pressure" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Heart Rate Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={healthRecords} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" name="Heart Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Sugar Level Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={healthRecords} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sugarLevel" stroke="#ffc658" name="Sugar Level" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

{/* Add and Delete Buttons */}
<div className="mb-6 flex space-x-96 ml-80">
  <button
    onClick={() => setShowForm(!showForm)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    {showForm ? 'Cancel' : 'Add New Health Record'}
  </button>
  
  <button
    onClick={() => setShowDeleteList(!showDeleteList)}
    className="bg-red-500 text-white px-4 py-2 rounded"
  >
    {showDeleteList ? 'Cancel' : 'Delete Health Record'}
  </button>
</div>

      {/* Conditional Form for Adding Health Records */}
      {showForm && (
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label htmlFor="date" className="block font-semibold">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="bloodPressure" className="block font-semibold">Blood Pressure</label>
            <input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="heartRate" className="block font-semibold">Heart Rate</label>
            <input
              type="text"
              id="heartRate"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="sugarLevel" className="block font-semibold">Sugar Level</label>
            <input
              type="text"
              id="sugarLevel"
              name="sugarLevel"
              value={formData.sugarLevel}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Record
          </button>
        </form>
      )}
 
       

      {/* Delete List for Health Records */}
      {showDeleteList && (
        <div className="space-y-4">
          <h3 className="font-semibold mb-2">Select Record to Delete</h3>
          <ul>
            {healthRecords.map((record) => (
              <li key={record.id} className="flex justify-between items-center border-b py-2">
                <span>{record.date}</span>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Doctor Visits Timeline */}
      <div className="mb-6">
  <h3 className="font-semibold mb-4">Doctor Visits Timeline</h3>

  {/* Container for the timeline */}
  <div className="relative flex items-center justify-center w-full space-x-12">
    
    {/* Horizontal line */}
    <div className="absolute inset-y-0 left-0 w-full border-t-2 border-gray-300"></div>
    
    {/* Loop through doctor visits */}
    {doctorVisits.map((visit, index) => (
      <div key={index} className="flex-none relative w-72 text-center">
        
        {/* Dot representing the visit */}
        <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white absolute top-[-20px] left-1/2 transform -translate-x-1/2"></div>

        {/* Date above the dot */}
        <p className="text-xs font-bold  text-gray-500 absolute top-[-35px] left-1/2 transform -translate-x-1/2">
          {new Date(visit.date).toLocaleDateString('en-GB')}
        </p>

        {/* Content of the visit below the dot */}
        <div className="mt-8">
          <p className="font-semibold text-lg">{visit.reason}</p>
          <p className="text-sm text-gray-600">Doctor: {visit.doctorName}</p>
          <p className="text-sm text-gray-600">
            Prescriptions: {Array.isArray(visit.prescription) ? visit.prescription.join(', ') : 'None'}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
      
     {/* Add and Delete Doctor Visit Buttons */}
<div className="mb-6 flex space-x-96 ml-80">
  <button
    onClick={() => setShowVisitForm(!showVisitForm)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    {showVisitForm ? 'Cancel' : 'Add New Doctor Visit'}
  </button>

  <button
    onClick={() => setShowDeleteVisitList(!showDeleteVisitList)}
    className="bg-red-500 text-white px-4 py-2 rounded"
  >
    {showDeleteVisitList ? 'Cancel' : 'Delete Doctor Visit'}
  </button>
</div>



      {/* Conditional Form for Adding Doctor Visit */}
      {showVisitForm && (
        <form onSubmit={handleAddVisit} className="space-y-4">
          <div>
            <label htmlFor="visitDate" className="block font-semibold">Visit Date</label>
            <input
              type="date"
              id="visitDate"
              name="visitDate"
              value={visitFormData.visitDate}
              onChange={handleVisitChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="reason" className="block font-semibold">Reason for Visit</label>
            <input
              type="text"
              id="reason"
              name="reason"
              value={visitFormData.reason}
              onChange={handleVisitChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="doctorName" className="block font-semibold">Doctor's Name</label>
            <input
              type="text"
              id="doctorName"
              name="doctorName"
              value={visitFormData.doctorName}
              onChange={handleVisitChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label htmlFor="prescription" className="block font-semibold">Prescriptions (comma separated)</label>
            <input
              type="text"
              id="prescription"
              name="prescription"
              value={visitFormData.prescription}
              onChange={handleVisitChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Visit
          </button>
        </form>
      )}


    
      {/* Delete List for Doctor Visits */}
      {showDeleteVisitList && (
        <div className="space-y-4">
          <h3 className="font-semibold mb-2">Select Doctor Visit to Delete</h3>
          <ul>
            {doctorVisits.map((visit) => (
              <li key={visit.id} className="flex justify-between items-center border-b py-2">
                <span>{visit.date} - {visit.doctorName}</span>
                <button
                  onClick={() => handleDeleteVisit(visit.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HealthBar;
