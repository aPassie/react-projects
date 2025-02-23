import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

export function SettingsManagement() {
  const [settings, setSettings] = useState({
    projectTags: [],
    difficultyLevels: [],
    achievementBadges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('tags');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (settingsError) throw settingsError;

      setSettings({
        projectTags: settingsData.project_tags || [],
        difficultyLevels: settingsData.difficulty_levels || [],
        achievementBadges: settingsData.achievement_badges || []
      });
    } catch (err) {
      setError('Failed to fetch settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setError('');
      setSuccess('');

      const { error: updateError } = await supabase
        .from('settings')
        .update({
          project_tags: settings.projectTags,
          difficulty_levels: settings.difficultyLevels,
          achievement_badges: settings.achievementBadges,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'global');

      if (updateError) throw updateError;

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    }
  };

  const addTag = () => {
    setSettings(prev => ({
      ...prev,
      projectTags: [...prev.projectTags, { id: Date.now(), name: '', color: '#3B82F6' }]
    }));
  };

  const addDifficultyLevel = () => {
    setSettings(prev => ({
      ...prev,
      difficultyLevels: [...prev.difficultyLevels, { 
        id: Date.now(),
        name: '',
        color: '#3B82F6',
        requiredPoints: 0
      }]
    }));
  };

  const addBadge = () => {
    setSettings(prev => ({
      ...prev,
      achievementBadges: [...prev.achievementBadges, {
        id: Date.now(),
        name: '',
        description: '',
        icon: '🏆',
        requiredPoints: 0
      }]
    }));
  };

  const updateTag = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      projectTags: prev.projectTags.map((tag, i) => 
        i === index ? { ...tag, [field]: value } : tag
      )
    }));
  };

  const updateDifficultyLevel = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.map((level, i) => 
        i === index ? { ...level, [field]: value } : level
      )
    }));
  };

  const updateBadge = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      achievementBadges: prev.achievementBadges.map((badge, i) => 
        i === index ? { ...badge, [field]: value } : badge
      )
    }));
  };

  const removeTag = (index) => {
    setSettings(prev => ({
      ...prev,
      projectTags: prev.projectTags.filter((_, i) => i !== index)
    }));
  };

  const removeDifficultyLevel = (index) => {
    setSettings(prev => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.filter((_, i) => i !== index)
    }));
  };

  const removeBadge = (index) => {
    setSettings(prev => ({
      ...prev,
      achievementBadges: prev.achievementBadges.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      <div className="flex space-x-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'tags'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Project Tags
        </button>
        <button
          onClick={() => setActiveTab('difficulty')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'difficulty'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Difficulty Levels
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'badges'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Achievement Badges
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'tags' && (
          <div className="space-y-4">
            {settings.projectTags.map((tag, index) => (
              <div key={tag.id} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => updateTag(index, 'name', e.target.value)}
                  placeholder="Tag name"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="color"
                  value={tag.color}
                  onChange={(e) => updateTag(index, 'color', e.target.value)}
                  className="w-12 h-8"
                />
                <button
                  onClick={() => removeTag(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addTag}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Tag
            </button>
          </div>
        )}

        {activeTab === 'difficulty' && (
          <div className="space-y-4">
            {settings.difficultyLevels.map((level, index) => (
              <div key={level.id} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={level.name}
                  onChange={(e) => updateDifficultyLevel(index, 'name', e.target.value)}
                  placeholder="Level name"
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="color"
                  value={level.color}
                  onChange={(e) => updateDifficultyLevel(index, 'color', e.target.value)}
                  className="w-12 h-8"
                />
                <input
                  type="number"
                  value={level.requiredPoints}
                  onChange={(e) => updateDifficultyLevel(index, 'requiredPoints', parseInt(e.target.value))}
                  placeholder="Required points"
                  className="w-32 p-2 border rounded"
                />
                <button
                  onClick={() => removeDifficultyLevel(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addDifficultyLevel}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Level
            </button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            {settings.achievementBadges.map((badge, index) => (
              <div key={badge.id} className="space-y-2 p-4 border rounded">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={badge.name}
                    onChange={(e) => updateBadge(index, 'name', e.target.value)}
                    placeholder="Badge name"
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={badge.icon}
                    onChange={(e) => updateBadge(index, 'icon', e.target.value)}
                    placeholder="🏆"
                    className="w-16 p-2 border rounded"
                  />
                  <button
                    onClick={() => removeBadge(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={badge.description}
                  onChange={(e) => updateBadge(index, 'description', e.target.value)}
                  placeholder="Badge description"
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  value={badge.requiredPoints}
                  onChange={(e) => updateBadge(index, 'requiredPoints', parseInt(e.target.value))}
                  placeholder="Required points"
                  className="w-32 p-2 border rounded"
                />
              </div>
            ))}
            <button
              onClick={addBadge}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Badge
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={saveSettings}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}