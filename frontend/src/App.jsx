import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Calendar as CalendarIcon, BookOpen, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import CalendarWidget from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

function App() {
  const [files, setFiles] = useState({
    registration: null,
    syllabus: null,
    routine: null,
    calendar: null,
    holidayCalendar: null
  });

  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e, type) => {
    setFiles(prev => ({
      ...prev,
      [type]: e.target.files[0]
    }));
  };

  const handleGenerate = async () => {
    if (!files.registration || !files.syllabus || !files.routine || !files.calendar || !files.holidayCalendar) {
      setError('Please upload all 5 required PDF documents.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    Object.keys(files).forEach(key => {
      formData.append(key, files[key]);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/schedule/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('API Response:', response.data);
      // Ensure dates are parsed correctly for the calendar
      const parsedData = response.data.schedule;
      if (parsedData.calendarEvents) {
        parsedData.calendarEvents = parsedData.calendarEvents.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        }));
      }
      setScheduleData(parsedData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred while generating the schedule.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = event.resourceColor || '#6366f1';
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (scheduleData) {
    return (
      <div className="dashboard-layout">
        {/* Sidebar: Subject Sniper & Priority Queue */}
        <aside className="sidebar">
          <div>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={24} /> Priority Queue
            </h2>
            <div className="queue-list">
              {scheduleData.todoList?.map((task, i) => (
                <div key={i} className={`queue-item ${task.priorityScore > 10 ? 'high' : task.priorityScore > 5 ? 'medium' : 'low'}`}>
                  <div className="queue-title">{task.title}</div>
                  <div className="queue-meta">
                    <span>{task.subject}</span>
                    <span style={{ fontWeight: 600, color: task.priorityScore > 10 ? '#ef4444' : '#fff' }}>{task.daysLeft} Days Left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={24} /> Mini Calendar
            </h2>
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
              <CalendarWidget value={new Date()} className="custom-calendar" />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={24} /> Subject Sniper
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scheduleData.subjectCards?.map((sub, i) => (
                <div key={i} className="glass-panel" style={{ padding: '1rem' }}>
                  <div className="subject-header" style={{ marginBottom: '0.5rem', paddingBottom: '0.25rem' }}>
                    <span className="subject-code">{sub.courseCode}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub.name}</span>
                  </div>
                  <div className="subject-topics" style={{ marginBottom: '0.5rem' }}>
                    {sub.topics?.slice(0, 3).join(', ')}{sub.topics?.length > 3 ? '...' : ''}
                  </div>
                  <div className="subject-weightage">
                    {sub.weightageBreakdown?.map((w, j) => (
                      <span key={j} className="weight-badge">{w.testName}: {w.marks}M</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content: Alerts & Smart Calendar */}
        <main className="main-content">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Chief of Staff Dashboard</h1>
            <button className="btn-primary" onClick={() => setScheduleData(null)}>Upload New PDFs</button>
          </header>

          {/* Contextual Alerts */}
          {scheduleData.alerts && scheduleData.alerts.length > 0 && (
            <div className="alerts-container">
              {scheduleData.alerts.map((alert, i) => (
                <div key={i} className="alert-banner">
                  <AlertTriangle className="alert-icon" size={20} />
                  <div className="alert-content">
                    <h4>{alert.alertType}</h4>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Smart Calendar Grid */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }}></span> Fixed Classes</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></span> High Priority Study</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%' }}></span> Standard Study</div>
            </div>
            <Calendar
              localizer={localizer}
              events={scheduleData.calendarEvents || []}
              startAccessor="start"
              endAccessor="end"
              defaultView="week"
              views={['week', 'day', 'agenda']}
              eventPropGetter={eventStyleGetter}
              min={new Date(0, 0, 0, 5, 0, 0)} // Start day at 5 AM
              max={new Date(0, 0, 0, 23, 59, 0)} // End day at 11:59 PM
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Personal Chief of Staff</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Upload your 5 PDFs to generate an intelligent, visually stunning calendar dashboard.</p>
      </header>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <div className="upload-grid">
          {[
            { id: 'registration', title: 'Registration Slip', icon: <FileText size={32} /> },
            { id: 'syllabus', title: 'Course Syllabus', icon: <BookOpen size={32} /> },
            { id: 'routine', title: 'Class Routine', icon: <Clock size={32} /> },
            { id: 'calendar', title: 'Academic Calendar', icon: <CalendarIcon size={32} /> },
            { id: 'holidayCalendar', title: 'Holiday Calendar', icon: <AlertTriangle size={32} /> }
          ].map(doc => (
            <div key={doc.id} className="glass-panel upload-card" style={{ borderColor: files[doc.id] ? '#10b981' : 'rgba(255,255,255,0.08)' }}>
              <input type="file" onChange={(e) => handleFileChange(e, doc.id)} accept=".pdf" disabled={loading} />
              <div className="upload-icon" style={{ color: files[doc.id] ? '#10b981' : '#6366f1' }}>
                {files[doc.id] ? <CheckCircle size={32} /> : doc.icon}
              </div>
              <div className="upload-title">{doc.title}</div>
              <div className={`upload-status ${files[doc.id] ? 'success' : ''}`}>
                {files[doc.id] ? files[doc.id].name : 'Click to select PDF'}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="spinner"></div>
              <p style={{ color: '#a5b4fc', textAlign: 'center' }}>Gemini 2.5 Flash is actively processing hundreds of pages and applying constraints...</p>
            </div>
          ) : (
            <button
              className="btn-primary"
              style={{ fontSize: '1.1rem', padding: '14px 32px' }}
              onClick={handleGenerate}
              disabled={Object.values(files).some(f => !f)}
            >
              Analyze & Generate Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
