import { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Editor } from '@monaco-editor/react';
import { supabase } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';

export function ProjectContent({ 
  content, 
  onUpdate,
  projectId 
}) {
  const [activeTab, setActiveTab] = useState('description');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (e, tab) => {
    e.preventDefault(); // Prevent form submission
    setActiveTab(tab);
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const file = e.target.files[0];
      if (!file) return;

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `project-content/${projectId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Update content with new file URL
      const updatedContent = {
        ...content,
        files: [...(content.files || []), { name: file.name, url: publicUrl }]
      };

      onUpdate(updatedContent);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      setError('Failed to upload file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (fileUrl) => {
    try {
      setError('');
      setSuccess('');

      // Extract the file path from the URL
      const filePath = fileUrl.split('/').slice(-2).join('/');

      // Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('project-files')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update content by removing the file
      const updatedContent = {
        ...content,
        files: content.files.filter(file => file.url !== fileUrl)
      };

      onUpdate(updatedContent);
      setSuccess('File removed successfully!');
    } catch (err) {
      setError('Failed to remove file: ' + err.message);
    }
  };

  const handleCodeSnippetUpdate = useCallback((language, newValue) => {
    onUpdate({
      ...content,
      codeSnippets: {
        ...(content.codeSnippets || {}),
        [language]: newValue
      }
    });
  }, [content, onUpdate]);

  return (
    <div className="space-y-6">
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

      {/* Content Type Tabs */}
      <div className="flex space-x-4 border-b border-neutral-700">
        <button
          type="button"
          onClick={(e) => handleTabChange(e, 'description')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'description'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Description
        </button>
        <button
          type="button"
          onClick={(e) => handleTabChange(e, 'code')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'code'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Code Snippets
        </button>
        <button
          type="button"
          onClick={(e) => handleTabChange(e, 'media')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'media'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Media
        </button>
        <button
          type="button"
          onClick={(e) => handleTabChange(e, 'resources')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'resources'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Resources
        </button>
      </div>

      {/* Description Editor */}
      {activeTab === 'description' && (
        <div data-color-mode="dark">
          <MDEditor
            value={content.description || ''}
            onChange={(value) => onUpdate({ ...content, description: value })}
            height={400}
          />
        </div>
      )}

      {/* Code Snippets */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">HTML</h3>
              <Editor
                height="300px"
                defaultLanguage="html"
                theme="vs-dark"
                value={content.codeSnippets?.html || ''}
                onChange={(value) => handleCodeSnippetUpdate('html', value)}
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">CSS</h3>
              <Editor
                height="300px"
                defaultLanguage="css"
                theme="vs-dark"
                value={content.codeSnippets?.css || ''}
                onChange={(value) => handleCodeSnippetUpdate('css', value)}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">JavaScript</h3>
            <Editor
              height="300px"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={content.codeSnippets?.javascript || ''}
              onChange={(value) => handleCodeSnippetUpdate('javascript', value)}
            />
          </div>
        </div>
      )}

      {/* Media Upload */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Upload Media
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-neutral-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer file:transition-colors
                disabled:opacity-50"
            />
          </div>

          {/* Images Preview */}
          <div>
            <h3 className="text-lg font-medium mb-2">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.images?.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => {
                      const newImages = [...content.images];
                      newImages[index].caption = e.target.value;
                      onUpdate({ ...content, images: newImages });
                    }}
                    className="mt-2 w-full px-2 py-1 bg-neutral-700 rounded"
                    placeholder="Image caption"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Videos Preview */}
          <div>
            <h3 className="text-lg font-medium mb-2">Videos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.videos?.map((video, index) => (
                <div key={index} className="space-y-2">
                  <video
                    src={video.url}
                    controls
                    className="w-full rounded-lg"
                  />
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => {
                      const newVideos = [...content.videos];
                      newVideos[index].title = e.target.value;
                      onUpdate({ ...content, videos: newVideos });
                    }}
                    className="w-full px-2 py-1 bg-neutral-700 rounded"
                    placeholder="Video title"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Upload Resource
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-neutral-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer file:transition-colors
                disabled:opacity-50"
            />
          </div>

          <div className="space-y-4">
            {content.resources?.map((resource, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-neutral-700 p-4 rounded-lg"
              >
                <div>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => {
                      const newResources = [...content.resources];
                      newResources[index].name = e.target.value;
                      onUpdate({ ...content, resources: newResources });
                    }}
                    className="bg-transparent border-none focus:outline-none"
                    placeholder="Resource name"
                  />
                  <p className="text-sm text-neutral-400">{resource.type}</p>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Files</label>
          <p className="mt-1 text-sm text-gray-500">
            Upload any additional files needed for this project (images, starter code, etc.)
          </p>
          <div className="mt-2">
            <label className="block">
              <span className="sr-only">Choose file</span>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className={`block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </label>
          </div>
        </div>

        {content.files?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
            <ul className="divide-y divide-gray-200">
              {content.files.map((file, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="ml-2 flex-1 w-0 truncate">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {file.name}
                      </a>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.url)}
                    className="ml-4 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 