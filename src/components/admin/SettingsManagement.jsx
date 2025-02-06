import { useState, useEffect } from 'react';
import { db, collection, doc, getDoc, setDoc } from '../../config/firebase';

export function SettingsManagement() {
  const [settings, setSettings] = useState({
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      accentColor: '#10B981',
      darkMode: true
    },
    platform: {
      siteName: 'Project Library',
      description: '',
      allowRegistration: true,
      requireEmailVerification: false,
      maxProjectsPerUser: 10
    },
    projectTags: [],
    difficultyLevels: [],
    achievementBadges: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('theme');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
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
      await setDoc(doc(db, 'settings', 'global'), settings);
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
        requirement: '',
        points: 0
      }]
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Platform Settings</h2>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="flex space-x-4 border-b border-neutral-700">
        {['theme', 'platform', 'tags', 'difficulty', 'badges'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Theme Settings */}
      {activeTab === 'theme' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Primary Color
              </label>
              <input
                type="color"
                value={settings.theme.primaryColor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  theme: { ...prev.theme, primaryColor: e.target.value }
                }))}
                className="mt-1 block w-full h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Secondary Color
              </label>
              <input
                type="color"
                value={settings.theme.secondaryColor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  theme: { ...prev.theme, secondaryColor: e.target.value }
                }))}
                className="mt-1 block w-full h-10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300">
                Accent Color
              </label>
              <input
                type="color"
                value={settings.theme.accentColor}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  theme: { ...prev.theme, accentColor: e.target.value }
                }))}
                className="mt-1 block w-full h-10 rounded-lg"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.theme.darkMode}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  theme: { ...prev.theme, darkMode: e.target.checked }
                }))}
                className="rounded border-neutral-700 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-neutral-300">
                Dark Mode
              </label>
            </div>
          </div>
          <div className="bg-neutral-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Preview</h3>
            {/* Add theme preview here */}
          </div>
        </div>
      )}

      {/* Platform Settings */}
      {activeTab === 'platform' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Site Name
            </label>
            <input
              type="text"
              value={settings.platform.siteName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                platform: { ...prev.platform, siteName: e.target.value }
              }))}
              className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Description
            </label>
            <textarea
              value={settings.platform.description}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                platform: { ...prev.platform, description: e.target.value }
              }))}
              className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.platform.allowRegistration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  platform: { ...prev.platform, allowRegistration: e.target.checked }
                }))}
                className="rounded border-neutral-700 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-neutral-300">
                Allow New Registrations
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.platform.requireEmailVerification}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  platform: { ...prev.platform, requireEmailVerification: e.target.checked }
                }))}
                className="rounded border-neutral-700 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-neutral-300">
                Require Email Verification
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">
              Max Projects Per User
            </label>
            <input
              type="number"
              value={settings.platform.maxProjectsPerUser}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                platform: { ...prev.platform, maxProjectsPerUser: parseInt(e.target.value) }
              }))}
              className="mt-1 block w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
              min="1"
            />
          </div>
        </div>
      )}

      {/* Project Tags */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          <button
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add New Tag
          </button>
          <div className="space-y-4">
            {settings.projectTags.map((tag, index) => (
              <div key={tag.id} className="flex items-center space-x-4">
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => {
                    const newTags = [...settings.projectTags];
                    newTags[index].name = e.target.value;
                    setSettings(prev => ({ ...prev, projectTags: newTags }));
                  }}
                  className="flex-1 rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  placeholder="Tag name"
                />
                <input
                  type="color"
                  value={tag.color}
                  onChange={(e) => {
                    const newTags = [...settings.projectTags];
                    newTags[index].color = e.target.value;
                    setSettings(prev => ({ ...prev, projectTags: newTags }));
                  }}
                  className="w-20 h-10 rounded-lg"
                />
                <button
                  onClick={() => {
                    const newTags = settings.projectTags.filter(t => t.id !== tag.id);
                    setSettings(prev => ({ ...prev, projectTags: newTags }));
                  }}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Levels */}
      {activeTab === 'difficulty' && (
        <div className="space-y-4">
          <button
            onClick={addDifficultyLevel}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add Difficulty Level
          </button>
          <div className="space-y-4">
            {settings.difficultyLevels.map((level, index) => (
              <div key={level.id} className="grid grid-cols-4 gap-4 items-center">
                <input
                  type="text"
                  value={level.name}
                  onChange={(e) => {
                    const newLevels = [...settings.difficultyLevels];
                    newLevels[index].name = e.target.value;
                    setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                  }}
                  className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  placeholder="Level name"
                />
                <input
                  type="color"
                  value={level.color}
                  onChange={(e) => {
                    const newLevels = [...settings.difficultyLevels];
                    newLevels[index].color = e.target.value;
                    setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                  }}
                  className="w-20 h-10 rounded-lg"
                />
                <input
                  type="number"
                  value={level.requiredPoints}
                  onChange={(e) => {
                    const newLevels = [...settings.difficultyLevels];
                    newLevels[index].requiredPoints = parseInt(e.target.value);
                    setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                  }}
                  className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  placeholder="Required points"
                  min="0"
                />
                <button
                  onClick={() => {
                    const newLevels = settings.difficultyLevels.filter(l => l.id !== level.id);
                    setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                  }}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <button
            onClick={addBadge}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add Achievement Badge
          </button>
          <div className="space-y-6">
            {settings.achievementBadges.map((badge, index) => (
              <div key={badge.id} className="bg-neutral-800 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={badge.name}
                    onChange={(e) => {
                      const newBadges = [...settings.achievementBadges];
                      newBadges[index].name = e.target.value;
                      setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                    }}
                    className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="Badge name"
                  />
                  <input
                    type="text"
                    value={badge.icon}
                    onChange={(e) => {
                      const newBadges = [...settings.achievementBadges];
                      newBadges[index].icon = e.target.value;
                      setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                    }}
                    className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="Badge icon (emoji)"
                  />
                </div>
                <textarea
                  value={badge.description}
                  onChange={(e) => {
                    const newBadges = [...settings.achievementBadges];
                    newBadges[index].description = e.target.value;
                    setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                  }}
                  className="w-full rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                  placeholder="Badge description"
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={badge.requirement}
                    onChange={(e) => {
                      const newBadges = [...settings.achievementBadges];
                      newBadges[index].requirement = e.target.value;
                      setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                    }}
                    className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="Achievement requirement"
                  />
                  <input
                    type="number"
                    value={badge.points}
                    onChange={(e) => {
                      const newBadges = [...settings.achievementBadges];
                      newBadges[index].points = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                    }}
                    className="rounded-lg bg-neutral-700 border-transparent focus:border-blue-500 focus:ring-0"
                    placeholder="Points awarded"
                    min="0"
                  />
                </div>
                <button
                  onClick={() => {
                    const newBadges = settings.achievementBadges.filter(b => b.id !== badge.id);
                    setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                  }}
                  className="w-full p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                >
                  Delete Badge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 