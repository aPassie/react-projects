import { useState, useEffect } from 'react';
import { db, collection, doc, getDoc, setDoc } from '../../config/firebase';

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
      const settingsDoc = await getDoc(doc(db, 'settings', 'global'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          projectTags: data.projectTags || [],
          difficultyLevels: data.difficultyLevels || [],
          achievementBadges: data.achievementBadges || []
        });
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
    return (
      <div className="flex items-center justify-center py-8 animate-pulse">
        <div className="text-slate-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Settings Management</h2>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        {[
          { id: 'tags', label: 'Tags' },
          { id: 'difficulty', label: 'Difficulty' },
          { id: 'badges', label: 'Badges' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 -mb-px transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Project Tags</h3>
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add Tag
              </button>
            </div>
            <div className="space-y-4">
              {settings.projectTags.map((tag, index) => (
                <div key={tag.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={tag.name}
                    onChange={(e) => {
                      const newTags = [...settings.projectTags];
                      newTags[index] = { ...tag, name: e.target.value };
                      setSettings(prev => ({ ...prev, projectTags: newTags }));
                    }}
                    placeholder="Tag name"
                    className="flex-1 px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                  />
                  <input
                    type="color"
                    value={tag.color}
                    onChange={(e) => {
                      const newTags = [...settings.projectTags];
                      newTags[index] = { ...tag, color: e.target.value };
                      setSettings(prev => ({ ...prev, projectTags: newTags }));
                    }}
                    className="w-12 h-10 rounded border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      const newTags = settings.projectTags.filter(t => t.id !== tag.id);
                      setSettings(prev => ({ ...prev, projectTags: newTags }));
                    }}
                    className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <span className="sr-only">Delete</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'difficulty' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Difficulty Levels</h3>
              <button
                onClick={addDifficultyLevel}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add Level
              </button>
            </div>
            <div className="space-y-4">
              {settings.difficultyLevels.map((level, index) => (
                <div key={level.id} className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => {
                      const newLevels = [...settings.difficultyLevels];
                      newLevels[index] = { ...level, name: e.target.value };
                      setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                    }}
                    placeholder="Level name"
                    className="px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                  />
                  <input
                    type="number"
                    value={level.requiredPoints}
                    onChange={(e) => {
                      const newLevels = [...settings.difficultyLevels];
                      newLevels[index] = { ...level, requiredPoints: parseInt(e.target.value) };
                      setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                    }}
                    placeholder="Required points"
                    className="px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={level.color}
                      onChange={(e) => {
                        const newLevels = [...settings.difficultyLevels];
                        newLevels[index] = { ...level, color: e.target.value };
                        setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                      }}
                      className="w-12 h-10 rounded border border-slate-200"
                    />
                    <button
                      onClick={() => {
                        const newLevels = settings.difficultyLevels.filter(l => l.id !== level.id);
                        setSettings(prev => ({ ...prev, difficultyLevels: newLevels }));
                      }}
                      className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                    >
                      <span className="sr-only">Delete</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-800">Achievement Badges</h3>
              <button
                onClick={addBadge}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Add Badge
              </button>
            </div>
            <div className="space-y-4">
              {settings.achievementBadges.map((badge, index) => (
                <div key={badge.id} className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={badge.name}
                      onChange={(e) => {
                        const newBadges = [...settings.achievementBadges];
                        newBadges[index] = { ...badge, name: e.target.value };
                        setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                      }}
                      placeholder="Badge name"
                      className="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                    />
                    <input
                      type="text"
                      value={badge.description}
                      onChange={(e) => {
                        const newBadges = [...settings.achievementBadges];
                        newBadges[index] = { ...badge, description: e.target.value };
                        setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                      }}
                      placeholder="Description"
                      className="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={badge.icon}
                        onChange={(e) => {
                          const newBadges = [...settings.achievementBadges];
                          newBadges[index] = { ...badge, icon: e.target.value };
                          setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                        }}
                        placeholder="Icon (emoji)"
                        className="w-20 px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                      />
                      <input
                        type="number"
                        value={badge.points}
                        onChange={(e) => {
                          const newBadges = [...settings.achievementBadges];
                          newBadges[index] = { ...badge, points: parseInt(e.target.value) };
                          setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                        }}
                        placeholder="Points"
                        className="flex-1 px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                      />
                      <button
                        onClick={() => {
                          const newBadges = settings.achievementBadges.filter(b => b.id !== badge.id);
                          setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                        }}
                        className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <span className="sr-only">Delete</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={badge.requirement}
                      onChange={(e) => {
                        const newBadges = [...settings.achievementBadges];
                        newBadges[index] = { ...badge, requirement: e.target.value };
                        setSettings(prev => ({ ...prev, achievementBadges: newBadges }));
                      }}
                      placeholder="Requirement"
                      className="w-full px-4 py-2 bg-white rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}