import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('stu-apply');

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    role: 'student'
  });

  const [stats, setStats] = useState({
    total_students: 0,
    available_rooms: 0,
    payments_received: 0,
    pending_maintenance: 0
  });

  const [maintenanceList, setMaintenanceList] = useState([]);
  const [myRoom, setMyRoom] = useState(null);
  const [myPayments, setMyPayments] = useState([]);

  const [applicationForm, setApplicationForm] = useState({
    program: '',
    year: '1',
    blockPref: 'A'
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    description: ''
  });

  const steelBlue = '#4682B4';

  /* ---------------- FETCH FUNCTIONS ---------------- */

  const fetchStats = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/dashboard/stats/");
    if (res.ok) setStats(await res.json());
  };

  const fetchMaintenance = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/maintenance/");
    if (res.ok) setMaintenanceList(await res.json());
  };

  const fetchMyRoom = async (studentId) => {
    if (!studentId) return;
    const res = await fetch(`http://127.0.0.1:8000/api/my-room/${studentId}/`);
    if (res.ok) {
      const data = await res.json();
      setMyRoom(data); // If backend returns null, state is properly cleared
    }
  };

  const fetchMyPayments = async (studentId) => {
    if (!studentId) return;
    const res = await fetch(`http://127.0.0.1:8000/api/student-payments/${studentId}/`);
    if (res.ok) setMyPayments(await res.json());
  };

  const fetchAllData = async (studentId) => {
    fetchStats();
    fetchMaintenance();
    if (studentId) {
      fetchMyRoom(studentId);
      fetchMyPayments(studentId);
    }
  };

  /* ---------------- LOGIN ---------------- */

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Could not connect to the backend server.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMyRoom(null);
    setMyPayments([]);
    setMaintenanceList([]);
    setCurrentView('stu-apply');
  };

  /* ---------------- LOAD DATA AFTER LOGIN ---------------- */

  useEffect(() => {
    if (user) {
      if (user.role === 'staff') {
        setCurrentView('staff-jobs'); 
      } else if (user.role === 'student') {
        setCurrentView('stu-apply'); 
      }
      fetchAllData(user.student_id);
    }
  }, [user]);

  /* ---------------- UPDATE MAINTENANCE ---------------- */

  const updateMaintenance = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/api/maintenance/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completed" })
    });

    if (res.ok) {
      fetchMaintenance();
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9', margin: 0, fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: steelBlue, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>NRC Hostel Portal</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>Management & Allocation Hub</p>

          <label style={labelStyle}>Username</label>
          <input type="text" required placeholder="Enter your system identifier" style={inputStyle} value={loginForm.username}
            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />

          <label style={labelStyle}>Password</label>
          <input type="password" required placeholder="••••••••" style={inputStyle} value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />

          <label style={labelStyle}>Portal Access Role</label>
          <select style={inputStyle}
            value={loginForm.role}
            onChange={e => setLoginForm({ ...loginForm, role: e.target.value })}>
            <option value="student">Student Portal</option>
            <option value="staff">Hostel Maintenance Staff</option>
          </select>

          <button type="submit" style={submitButtonStyle(steelBlue)}>LOGIN</button>
        </form>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', margin: 0, padding: 0, fontFamily: 'sans-serif', flexDirection: 'column' }}>

      <div style={{ display: 'flex', flexGrow: 1 }}>

        {/* SIDEBAR NAVIGATION PANEL */}
        <div style={{ width: '280px', background: steelBlue, color: '#fff', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.1)' }}>
          
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', letterSpacing: '0.5px' }}>NRC CAMPUS</h3>
          <span style={{ fontSize: '12px', color: '#e0e0e0', textTransform: 'uppercase', marginBottom: '20px', display: 'block' }}>Hostel System v2.0</span>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '6px', marginBottom: '25px', fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold' }}>{user.username}</div>
            <div style={{ opacity: 0.8, fontSize: '12px', marginTop: '2px', textTransform: 'capitalize' }}>Role: {user.role}</div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>

            {user.role === 'student' && (
              <>
                <button onClick={() => setCurrentView('stu-apply')} style={navButtonStyle(currentView === 'stu-apply')}>Apply for Accommodation</button>
                <button onClick={() => setCurrentView('stu-room')} style={navButtonStyle(currentView === 'stu-room')}>Check My Room Space</button>
                <button onClick={() => setCurrentView('stu-pay')} style={navButtonStyle(currentView === 'stu-pay')}>Verify Fees Status</button>
                <button onClick={() => setCurrentView('stu-maint')} style={navButtonStyle(currentView === 'stu-maint')}>File Maintenance Report</button>
              </>
            )}

            {user.role === 'staff' && (
              <button onClick={() => setCurrentView('staff-jobs')} style={navButtonStyle(currentView === 'staff-jobs')}>
                Assigned Repair Queue
              </button>
            )}

          </nav>

          <button onClick={handleLogout} style={{ ...navButtonStyle(false), background: '#d9534f', marginTop: 'auto', fontWeight: 'bold', textAlign: 'center' }}>
            LOG OUT
          </button>
        </div>

        {/* WORKSPACE MIDDLEVIEW DISPLAY PANE */}
        <div style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>

          {/* APPLY */}
          {currentView === 'stu-apply' && (
            <div style={formContainerStyle}>
              <h3 style={{ color: steelBlue, marginTop: 0 }}>Accommodation Application Window</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();

                const res = await fetch("http://127.0.0.1:8000/api/apply/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    student: user.student_id,
                    program: applicationForm.program,
                    year: applicationForm.year,
                    block: applicationForm.blockPref
                  })
                });

                if (res.ok) {
                  alert("Application submitted successfully!");
                } else {
                  const errData = await res.json();
                  alert(errData.message || "Failed to submit application.");
                }
              }}>

                <label style={labelStyle}>Academic Program</label>
                <input type="text" placeholder="e.g., BSc in Agriculture" style={inputStyle} required
                  onChange={e => setApplicationForm({ ...applicationForm, program: e.target.value })} />

                <label style={labelStyle}>Year of Study</label>
                <select style={inputStyle}
                  onChange={e => setApplicationForm({ ...applicationForm, year: e.target.value })}>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>

                <label style={labelStyle}>Block Preference</label>
                <select style={inputStyle}
                  onChange={e => setApplicationForm({ ...applicationForm, blockPref: e.target.value })}>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                  <option value="E">Block E</option>
                  <option value="F">Block F</option>
                </select>

                <button type="submit" style={submitButtonStyle(steelBlue)}>SUBMIT ROOM APPLICATION</button>
              </form>
            </div>
          )}

          {/* ROOM */}
          {currentView === 'stu-room' && (
            <div style={formContainerStyle}>
              <h3 style={{ color: steelBlue, marginTop: 0 }}>My Personal Room Status</h3>
              <div style={{ display: 'grid', gap: '15px', fontSize: '16px', marginTop: '15px' }}>
                {myRoom && myRoom.room ? (
                  <>
                    <div><b>Allocated Room:</b> <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{myRoom.room}</span></div>
                    <div><b>Hostel Block Assignment:</b> {myRoom.block}</div>
                    <div><b>Assigned Roommate Capacity:</b> {myRoom.capacity}-Sharing Unit</div>
                    <div><b>Duration Framework:</b> 1 Full Academic Semester</div>
                  </>
                ) : (
                  <div style={{ color: '#7f8c8d' }}>No room assigned down standard tracks yet. Please wait for Admin Allocation.</div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {currentView === 'stu-pay' && (
            <div style={formContainerStyle}>
              <h3 style={{ color: steelBlue, marginTop: 0 }}>My Personal Ledger Statement</h3>
              {myPayments.length === 0 ? (
                <p style={{ color: '#777', marginTop: '20px' }}>No payment transaction records found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ background: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date Logged</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Amount Tracked</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPayments.map((p, i) => (
                      <tr key={i}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{p.date}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontWeight: '500' }}>MK {p.amount?.toLocaleString()}</td>
                        <td style={{ 
                          padding: '12px', 
                          borderBottom: '1px solid #eee', 
                          color: p.status === 'Verified' || p.status === 'Paid' ? '#27ae60' : '#f39c12', 
                          fontWeight: 'bold' 
                        }}>
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* MAINTENANCE */}
          {currentView === 'stu-maint' && (
            <div style={formContainerStyle}>
              <h3 style={{ color: steelBlue, marginTop: 0 }}>New Maintenance Request Submission</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();

                const res = await fetch("http://127.0.0.1:8000/api/maintenance/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    student: user.student_id,
                    room_number: myRoom?.room || "Unknown",
                    problem_description: maintenanceForm.description,
                    status: "Pending"
                  })
                });

                if (res.ok) {
                  alert("Maintenance request submitted successfully!");
                  setMaintenanceForm({ description: '' });
                  fetchMaintenance();
                }
              }}>

                <label style={labelStyle}>Your Room Number</label>
                <input type="text" value={myRoom?.room || "Unknown"} style={inputStyle} readOnly required />

                <label style={labelStyle}>Problem Description</label>
                <textarea rows="4" value={maintenanceForm.description} placeholder="Describe structural repair needed..." style={inputStyle} required
                  onChange={e => setMaintenanceForm({ description: e.target.value })} />

                <button type="submit" style={submitButtonStyle(steelBlue)}>SUBMIT REPAIR JOB REQUEST</button>
              </form>
            </div>
          )}

          {/* STAFF JOBS */}
          {currentView === 'staff-jobs' && (
            <div>
              <h3 style={{ color: steelBlue, marginTop: 0 }}>Assigned Repairs Job Dashboard</h3>
              {maintenanceList.length === 0 ? (
                <p>No jobs found in system queues.</p>
              ) : (
                maintenanceList.map((m, i) => (
                  <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '15px', borderLeft: `4px solid ${m.status === 'Pending' ? '#f39c12' : m.status === 'In Progress' ? '#3498db' : '#27ae60'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h5 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Room {m.room_number}</h5>
                        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>"{m.problem_description}"</p>
                        <span style={{ fontSize: '12px', color: '#888', display: 'block', marginTop: '5px' }}>Status: {m.status}</span>
                      </div>
                      {m.status !== "Completed" && (
                        <button onClick={() => updateMaintenance(m.request_id)} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          MARK COMPLETED
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
      <footer style={{ background: '#222', color: '#bbb', padding: '15px 20px', fontSize: '13px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        &copy; {new Date().getFullYear()} NRC Hostel Management System. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const navButtonStyle = (isActive) => ({
  background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  color: '#ffffff',
  border: 'none',
  padding: '12px 16px',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '14px',
  transition: 'background 0.2s'
});

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '14px', color: '#34495e' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '15px', boxSizing: 'border-box' };
const submitButtonStyle = (color) => ({ background: color, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', width: '100%' });
const formContainerStyle = { background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '600px' };