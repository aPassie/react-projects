import { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy, updateDoc, doc } from '../../config/firebase';

export function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'disabled'
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, filterStatus, students]);

  const fetchStudents = async () => {
    try {
      const studentsQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(studentsQuery);
      const studentsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => !user.isAdmin);
      setStudents(studentsData);
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => 
        filterStatus === 'active' ? !student.disabled : student.disabled
      );
    }

    setFilteredStudents(filtered);
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        disabled: !currentStatus
      });
      
      // Update local state
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, disabled: !currentStatus }
          : student
      ));
      
      if (selectedStudent?.id === studentId) {
        setSelectedStudent({ ...selectedStudent, disabled: !currentStatus });
      }
    } catch (err) {
      setError('Failed to update student status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 animate-pulse">
        <div className="text-slate-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Students List */}
      <div className="md:col-span-1 space-y-6 animate-fade-in">
        {/* Search and Filters */}
        <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="group">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
            />
          </div>
          
          <div className="group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50 hover:border-blue-400 transition-all duration-200"
            >
              <option value="all">All Students</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full p-4 text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                selectedStudent?.id === student.id
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:shadow'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{student.email}</p>
                  <p className="text-sm text-slate-600">
                    {student.completedProjects?.length || 0} projects completed
                  </p>
                </div>
                {student.disabled && (
                  <span className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full font-medium">
                    Disabled
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Student Details */}
      <div className="md:col-span-2">
        {selectedStudent ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm animate-fade-in-up">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{selectedStudent.email}</h3>
                  <p className="text-slate-600">
                    Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleStudentStatus(selectedStudent.id, selectedStudent.disabled)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    selectedStudent.disabled
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {selectedStudent.disabled ? 'Enable Account' : 'Disable Account'}
                </button>
              </div>

              {/* Progress Overview */}
              <div>
                <h4 className="text-lg font-medium text-slate-800 mb-4">Progress Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-blue-200 transition-all duration-200">
                    <p className="text-sm text-slate-600">Completed Projects</p>
                    <p className="text-2xl font-bold text-slate-800">{selectedStudent.completedProjects?.length || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-blue-200 transition-all duration-200">
                    <p className="text-sm text-slate-600">In Progress</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {Object.keys(selectedStudent.projectProgress || {}).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="text-lg font-medium text-slate-800 mb-4">Activity Timeline</h4>
                <div className="space-y-4">
                  {selectedStudent.activityLog?.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-200 transition-all duration-200">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium text-slate-800">{activity.action}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-slate-600 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-white rounded-lg border border-slate-200 p-8">
            <p className="text-slate-600">Select a student to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}