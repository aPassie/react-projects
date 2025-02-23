import { useState } from 'react';
import { supabase } from '../../config/supabase';

export function ProjectImportExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const exportProjects = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (projectsError) throw projectsError;

      // Create a JSON file with the projects data
      const jsonData = JSON.stringify(projects, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `projects_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Projects exported successfully!');
    } catch (err) {
      setError('Failed to export projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const importProjects = async (event) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const file = event.target.files[0];
      if (!file) {
        throw new Error('No file selected');
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const projects = JSON.parse(e.target.result);
          
          // Validate the imported data structure
          if (!Array.isArray(projects)) {
            throw new Error('Invalid file format: Expected an array of projects');
          }

          // Insert projects one by one to handle errors gracefully
          let successCount = 0;
          let errorCount = 0;

          for (const project of projects) {
            const { error: insertError } = await supabase
              .from('projects')
              .upsert({
                ...project,
                updated_at: new Date().toISOString(),
                created_at: project.created_at || new Date().toISOString()
              });

            if (insertError) {
              console.error(`Failed to import project: ${project.title}`, insertError);
              errorCount++;
            } else {
              successCount++;
            }
          }

          setSuccess(`Import completed: ${successCount} projects imported successfully, ${errorCount} failed`);
        } catch (err) {
          setError('Failed to parse import file: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Failed to import projects: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Project Import/Export</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Projects</h3>
          <p className="text-gray-600 mb-4">
            Download all projects as a JSON file. This file can be used to backup your projects or
            transfer them to another instance.
          </p>
          <button
            onClick={exportProjects}
            disabled={loading}
            className={`w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Exporting...' : 'Export Projects'}
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Projects</h3>
          <p className="text-gray-600 mb-4">
            Import projects from a JSON file. The file should be in the same format as the exported
            file.
          </p>
          <label className="block">
            <span className="sr-only">Choose file</span>
            <input
              type="file"
              accept=".json"
              onChange={importProjects}
              disabled={loading}
              className={`block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </label>
        </div>
      </div>
    </div>
  );
} 