import { useState } from 'react';
import { db, collection, addDoc, getDocs, query } from '../../config/firebase';

export function ProjectImportExport() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      setError('');
      setSuccess('');

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const projects = JSON.parse(e.target.result);
          
          // Validate projects structure
          if (!Array.isArray(projects)) {
            throw new Error('Invalid file format. Expected an array of projects.');
          }

          // Import each project
          for (const project of projects) {
            await addDoc(collection(db, 'projects'), {
              ...project,
              importedAt: new Date().toISOString()
            });
          }

          setSuccess(`Successfully imported ${projects.length} projects`);
        } catch (err) {
          setError('Failed to parse import file: ' + err.message);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Failed to import projects: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError('');
      setSuccess('');

      const projectsQuery = query(collection(db, 'projects'));
      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create and download file
      const dataStr = JSON.stringify(projects, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `projects-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`Successfully exported ${projects.length} projects`);
    } catch (err) {
      setError('Failed to export projects: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Import/Export Projects</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Import Projects</h3>
          <p className="text-slate-600 mb-4">
            Import projects from a JSON file. The file should contain an array of project objects.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-medium
              file:bg-blue-500 file:text-white
              hover:file:bg-blue-600
              file:cursor-pointer file:transition-colors
              file:active:scale-95
              disabled:opacity-50"
          />
        </div>

        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-4">Export Projects</h3>
          <p className="text-slate-600 mb-4">
            Export all projects to a JSON file. This includes all project data and settings.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : 'Export Projects'}
          </button>
        </div>
      </div>
    </div>
  );
} 