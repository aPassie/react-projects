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

  const StudentDetails = ({ student }) => {
    if (!student) return null;

    return (
      <div className="bg-neutral-800 p-6 rounded-lg space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{student.email}</h3>
            <p className="text-neutral-400">
              Joined: {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => toggleStudentStatus(student.id, student.disabled)}
            className={`px-4 py-2 rounded-lg ${
              student.disabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {student.disabled ? 'Enable Account' : 'Disable Account'}
          </button>
        </div>

        {/* Progress Overview */}
        <div>
          <h4 className="font-medium mb-2">Progress Overview</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-700 p-4 rounded-lg">
              <p className="text-sm text-neutral-400">Completed Projects</p>
              <p className="text-2xl font-bold">{student.completedProjects?.length || 0}</p>
            </div>
            <div className="bg-neutral-700 p-4 rounded-lg">
              <p className="text-sm text-neutral-400">In Progress</p>
              <p className="text-2xl font-bold">
                {Object.keys(student.projectProgress || {}).length}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h4 className="font-medium mb-2">Activity Timeline</h4>
          <div className="space-y-4">
            {student.activityLog?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-neutral-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-neutral-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading students...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Students List */}
      <div className="md:col-span-1 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Students List */}
        <div className="space-y-2">
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full p-4 text-left rounded-lg transition-colors ${
                selectedStudent?.id === student.id
                  ? 'bg-blue-600'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{student.email}</p>
                  <p className="text-sm text-neutral-400">
                    {student.completedProjects?.length || 0} projects completed
                  </p>
                </div>
                {student.disabled && (
                  <span className="px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded">
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
          <StudentDetails student={selectedStudent} />
        ) : (
          <div className="bg-neutral-800 p-6 rounded-lg text-center text-neutral-400">
            Select a student to view details
          </div>
        )}
      </div>
    </div>
  );
} 