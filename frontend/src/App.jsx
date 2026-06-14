import React, { useState } from 'react';
import axios from 'axios';
import {
  Calendar as CalendarIcon, BookOpen, Clock, AlertTriangle, FileText,
  ChevronRight, LayoutDashboard, Share2, Settings, Search, Plus
} from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import CalendarWidget from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);
const API = import.meta.env.VITE_API_URL;

const DOC_CONFIG = [
  { id: 'registration',    label: 'Registration Slip', desc: 'Enrolled courses and section info',   icon: FileText },
  { id: 'syllabus',        label: 'Course Syllabus',   desc: 'Topics, exams & marks breakdown',     icon: BookOpen },
  { id: 'routine',         label: 'Class Routine',     desc: 'Weekly timetable and timings',         icon: Clock },
  { id: 'calendar',        label: 'Academic Calendar', desc: 'Semester dates and exam schedule',     icon: CalendarIcon },
  { id: 'holidayCalendar', label: 'Holiday List',      desc: 'Public and university holidays',       icon: AlertTriangle },
];

/* ── Auth helpers ──────────────────────────────────────── */
function getToken()   { return localStorage.getItem('ap_token'); }
function getUser()    { try { return JSON.parse(localStorage.getItem('ap_user')); } catch { return null; } }
function saveAuth(token, user) {
  localStorage.setItem('ap_token', token);
  localStorage.setItem('ap_user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('ap_token');
  localStorage.removeItem('ap_user');
}
function authHeader() { return { Authorization: `Bearer ${getToken()}` }; }

/* ── Auth pages ────────────────────────────────────────── */
function AuthPage({ onLogin }) {
  const [mode, setMode]       = useState('login');   // 'login' | 'register' | 'pending' | 'verified'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const reset = () => { setError(''); setSuccess(''); };

  const handleRegister = async (e) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, { name, email, password });
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <CalendarIcon size={20} color="white" />
        </div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Log in to access your study scheduler.'
            : 'Sign up to start planning your semester.'}
        </p>

        <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {mode === 'register' && (
            <div className="form-field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <div className="form-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don&apos;t have an account? <button onClick={() => { setMode('register'); reset(); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); reset(); }}>Log in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shell components ──────────────────────────────────── */
function LeftSidebar({ activeView, onNavigate, hasSchedule }) {
  const [showLogout, setShowLogout] = useState(false);
  const user = getUser();

  return (
    <aside className="left-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <CalendarIcon size={16} color="white" />
        </div>

        <button
          className={`sidebar-icon-btn ${activeView === 'upload' ? 'active' : ''}`}
          title="Home"
          onClick={() => onNavigate('upload')}
        >
          <LayoutDashboard size={17} />
        </button>

        <button
          className={`sidebar-icon-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          title={hasSchedule ? 'Schedule' : 'Generate a schedule first'}
          onClick={() => hasSchedule && onNavigate('dashboard')}
          style={!hasSchedule ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
        >
          <CalendarIcon size={17} />
        </button>

        <button
          className="sidebar-icon-btn"
          title="Subjects — coming soon"
          style={{ opacity: 0.25, cursor: 'not-allowed' }}
        >
          <BookOpen size={17} />
        </button>

        <button
          className="sidebar-icon-btn"
          title="Share — coming soon"
          style={{ opacity: 0.25, cursor: 'not-allowed' }}
        >
          <Share2 size={17} />
        </button>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <button
          className="sidebar-icon-btn"
          title="Settings — coming soon"
          style={{ opacity: 0.25, cursor: 'not-allowed' }}
        >
          <Settings size={17} />
        </button>

        <div style={{ position: 'relative' }}>
          <div
            className="sidebar-user-avatar"
            title={user?.name || ''}
            onClick={() => setShowLogout(v => !v)}
          >
            {user?.name?.[0]?.toUpperCase() || 'K'}
          </div>

          {showLogout && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setShowLogout(false)}
              />
              <div className="logout-popover">
                <div className="logout-popover-name">{user?.name}</div>
                <div className="logout-popover-email">{user?.email}</div>
                <hr className="logout-divider" />
                <button
                  className="logout-btn"
                  onClick={() => { clearAuth(); window.location.reload(); }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, badge, actions }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="breadcrumb-tab">
          {title}
          {badge && <span className="breadcrumb-badge">{badge}</span>}
        </span>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn" title="Search (coming soon)" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
          <Search size={14} />
        </button>
        <div className="topbar-avatar" title={getUser()?.email || ''}>
          {getUser()?.name?.[0]?.toUpperCase() || 'K'}
        </div>
        {actions}
      </div>
    </header>
  );
}

/* ── Main App ───────────────────────────────────────────── */
function MainApp() {
  const [view, setView]             = useState('upload');
  const [files, setFiles]           = useState({
    registration: null, syllabus: null, routine: null,
    calendar: null, holidayCalendar: null,
  });
  const [loading, setLoading]       = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [error, setError]           = useState(null);

  const handleFileChange = (e, type) => {
    setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
  };

  const handleGenerate = async () => {
    if (Object.values(files).some(f => !f)) {
      setError('Please upload all 5 required PDF documents.');
      return;
    }
    setError(null);
    setLoading(true);
    const formData = new FormData();
    Object.keys(files).forEach(key => formData.append(key, files[key]));
    try {
      const response = await axios.post(`${API}/api/schedule/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...authHeader() },
      });
      const parsedData = response.data.schedule;
      if (parsedData.calendarEvents) {
        parsedData.calendarEvents = parsedData.calendarEvents.map(ev => ({
          ...ev, start: new Date(ev.start), end: new Date(ev.end),
        }));
      }
      setScheduleData(parsedData);
      setView('dashboard');
    } catch (err) {
      if (err.response?.status === 401) { clearAuth(); window.location.reload(); return; }
      setError(err.response?.data?.error || 'Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => ({
    style: { backgroundColor: event.resourceColor || '#7c3aed', borderRadius: '4px', color: 'white', border: 'none' },
  });

  const uploadedCount = Object.values(files).filter(Boolean).length;

  /* ── Dashboard ── */
  if (view === 'dashboard' && scheduleData) {
    return (
      <div className="app-shell">
        <LeftSidebar activeView="dashboard" onNavigate={setView} hasSchedule={!!scheduleData} />
        <div className="app-main">
          <Topbar
            title="Study Schedule"
            actions={
              <button className="btn-secondary" onClick={() => setView('upload')}>
                ← Back
              </button>
            }
          />
          <div className="dashboard-main">
            <div className="dashboard-calendar-area">
              {scheduleData.alerts?.length > 0 && (
                <div className="alerts-strip">
                  {scheduleData.alerts.map((alert, i) => (
                    <div key={i} className="alert-item">
                      <AlertTriangle className="alert-icon" size={14} />
                      <div>
                        <h4>{alert.alertType}</h4>
                        <p>{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="calendar-header" style={{ marginTop: scheduleData.alerts?.length ? '0.75rem' : 0 }}>
                <div className="calendar-legend">
                  <span><span className="legend-dot" style={{ background: '#16a34a' }} />Classes</span>
                  <span><span className="legend-dot" style={{ background: '#dc2626' }} />High priority</span>
                  <span><span className="legend-dot" style={{ background: '#7c3aed' }} />Study blocks</span>
                </div>
              </div>
              <Calendar
                localizer={localizer}
                events={scheduleData.calendarEvents || []}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={['week', 'day', 'agenda']}
                eventPropGetter={eventStyleGetter}
                min={new Date(0, 0, 0, 5, 0, 0)}
                max={new Date(0, 0, 0, 23, 59, 0)}
              />
            </div>
            <aside className="dash-right">
              <div className="dash-section">
                <div className="dash-section-title">Priority Queue</div>
                {scheduleData.todoList?.map((task, i) => (
                  <div key={i} className={`queue-item ${task.priorityScore > 10 ? 'high' : task.priorityScore > 5 ? 'medium' : 'low'}`}>
                    <div className="queue-title">{task.title}</div>
                    <div className="queue-meta">
                      <span>{task.subject}</span>
                      <span className={task.priorityScore > 10 ? 'days-high' : ''}>{task.daysLeft}d left</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dash-section">
                <div className="dash-section-title">Calendar</div>
                <CalendarWidget value={new Date()} className="custom-calendar" />
              </div>
              <div className="dash-section">
                <div className="dash-section-title">Subjects</div>
                {scheduleData.subjectCards?.map((sub, i) => (
                  <div key={i} className="subject-card">
                    <div className="subject-code">{sub.courseCode}</div>
                    <div className="subject-name">{sub.name}</div>
                    <div className="subject-topics">
                      {sub.topics?.slice(0, 3).join(' · ')}
                      {sub.topics?.length > 3 ? ` +${sub.topics.length - 3} more` : ''}
                    </div>
                    <div className="subject-weightage">
                      {sub.weightageBreakdown?.map((w, j) => (
                        <span key={j} className="weight-badge">{w.testName} {w.marks}M</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  /* ── Upload ── */
  return (
    <div className="app-shell">
      <LeftSidebar activeView="upload" onNavigate={setView} hasSchedule={!!scheduleData} />
      <div className="app-main">
        <Topbar
          title="Academic Planner"
          badge="Beta"
          actions={
            <button className="btn-new-schedule" onClick={() => {
              setFiles({ registration: null, syllabus: null, routine: null, calendar: null, holidayCalendar: null });
              setScheduleData(null);
              setError(null);
              setView('upload');
            }}>
              <Plus size={14} /> New Schedule
            </button>
          }
        />
        <main className="upload-content">
          <div className="orb" />
          <h1 className="hero-title">
            Good {getTimeOfDay()}, {getUser()?.name?.split(' ')[0] || 'there'},<br />
            <span className="hero-highlight">what shall we plan?</span>
          </h1>
          <p className="hero-subtitle">
            Upload your 5 university PDFs — I&apos;ll build a complete, prioritized study schedule around your exams and classes.
          </p>

          <div className="upload-cards-row">
            {DOC_CONFIG.map((doc) => {
              const Icon = doc.icon;
              const done = !!files[doc.id];
              return (
                <div key={doc.id} className={`upload-card ${done ? 'done' : ''}`}>
                  <input type="file" onChange={(e) => handleFileChange(e, doc.id)} accept=".pdf" disabled={loading} />
                  <div className="card-icon"><Icon size={15} /></div>
                  <div className="card-label">{doc.label}</div>
                  <div className="card-desc">{done ? files[doc.id].name : doc.desc}</div>
                  {done && <div className="card-check-badge">✓</div>}
                </div>
              );
            })}
          </div>

          <div className="generate-row">
            {error && <div className="error-msg">{error}</div>}
            {loading ? (
              <div className="loading-inline">
                <div className="spinner" />
                Analyzing your documents...
              </div>
            ) : (
              <button className="btn-generate" onClick={handleGenerate} disabled={uploadedCount < 5}>
                Generate Schedule <ChevronRight size={15} />
              </button>
            )}
            <span className="upload-progress-text">{uploadedCount} of 5 documents uploaded</span>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(getUser());

  if (!user) {
    return <AuthPage onLogin={(u) => setUser(u)} />;
  }

  return <MainApp />;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
