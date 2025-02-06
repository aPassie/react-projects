import { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Editor } from '@monaco-editor/react';
import { storage, ref, uploadBytes, getDownloadURL } from '../../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export function ProjectContent({ 
  content, 
  onUpdate,
  projectId 
}) {
  const [activeTab, setActiveTab] = useState('description');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (e, tab) => {
    e.preventDefault(); // Prevent form submission
    setActiveTab(tab);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const fileExtension = file.name.split('.').pop();
      const fileName = `${projectId}/${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, `projects/${fileName}`);
      
      // Add metadata
      const metadata = {
        contentType: file.type,
      };

      await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(storageRef);

      // Update content based on file type
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
        onUpdate({
          ...content,
          images: [...(content.images || []), { url: downloadURL, caption: file.name }]
        });
      } else if (fileType === 'video') {
        onUpdate({
          ...content,
          videos: [...(content.videos || []), { url: downloadURL, title: file.name }]
        });
      } else {
        onUpdate({
          ...content,
          resources: [...(content.resources || []), { url: downloadURL, name: file.name, type: fileType }]
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        'Failed to upload file: ' + 
        (err.message || 'Please check your Firebase configuration and try again')
      );
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
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
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
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
    </div>
  );
} 