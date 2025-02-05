import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { projects } from '../data/projects';

export function UserProfile({ completedProjects, projectProgress }) {
  const [username, setUsername] = useLocalStorage('username', '');
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'achievements', 'activity', 'skills'

  const totalProjects = projects.length;
  const completedCount = completedProjects.length;
  const inProgressCount = Object.keys(projectProgress).length - completedCount;

  // Calculate skill levels based on completed projects
  const skills = {
    'React Basics': calculateSkillLevel(['useState', 'useEffect', 'Components']),
    'State Management': calculateSkillLevel(['Redux', 'Context', 'useState']),
    'Routing': calculateSkillLevel(['React Router', 'Navigation']),
    'API Integration': calculateSkillLevel(['Fetch', 'Axios', 'REST']),
    'Styling': calculateSkillLevel(['CSS', 'Tailwind', 'Styled Components']),
  };

  function calculateSkillLevel(relatedTags) {
    const relevantProjects = completedProjects.filter(projectId => {
      const project = projects.find(p => p.id === projectId);
      return project?.tags.some(tag => relatedTags.includes(tag));
    });
    return Math.min(100, (relevantProjects.length / 3) * 100);
  }

  const achievements = [
    {
      id: 'first-project',
      title: 'First Steps',
      description: 'Complete your first project',
      icon: '🎯',
      isUnlocked: completedCount >= 1
    },
    {
      id: 'beginner-master',
      title: 'Beginner Master',
      description: 'Complete all beginner projects',
      icon: '🌟',
      isUnlocked: projects
        .filter(p => p.difficulty === 'Beginner')
        .every(p => completedProjects.includes(p.id))
    },
    {
      id: 'streak-master',
      title: 'Consistency is Key',
      description: 'Complete projects 3 days in a row',
      icon: '🔥',
      isUnlocked: false
    },
    {
      id: 'note-taker',
      title: 'Diligent Student',
      description: 'Take notes in 5 different projects',
      icon: '📝',
      isUnlocked: false
    },
  ];

  const recentActivity = [
    // You would typically get this from a more sophisticated tracking system
    ...completedProjects.slice(-3).map(projectId => {
      const project = projects.find(p => p.id === projectId);
      return {
        type: 'completion',
        project: project?.title,
        date: new Date().toLocaleDateString(),
      };
    }),
  ];

  const handleSaveUsername = () => {
    setUsername(tempUsername);
    setIsEditing(false);
  };

  // Add these new sections to the tabs array
  const tabs = ['overview', 'achievements', 'activity', 'skills', 'resources', 'study-plan'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-neutral-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="bg-neutral-700 px-3 py-2 rounded"
                placeholder="Enter your username"
              />
              <button
                onClick={handleSaveUsername}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center text-2xl">
                {username ? username[0].toUpperCase() : 'A'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{username || 'Anonymous User'}</h2>
                <p className="text-neutral-400">Learning React since {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-neutral-400 hover:text-white"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-400">{totalProjects}</div>
            <div className="text-sm text-neutral-400">Total Projects</div>
          </div>
          <div className="bg-neutral-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400">{completedCount}</div>
            <div className="text-sm text-neutral-400">Completed</div>
          </div>
          <div className="bg-neutral-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-yellow-400">{inProgressCount}</div>
            <div className="text-sm text-neutral-400">In Progress</div>
          </div>
          <div className="bg-neutral-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round((completedCount / totalProjects) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Completion Rate</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-neutral-700 mb-6">
          {tabs.map(tab => (
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Learning Progress</h3>
            <div className="w-full bg-neutral-700 rounded-full h-4">
              <div
                className="bg-blue-500 rounded-full h-full transition-all duration-500"
                style={{ width: `${(completedCount / totalProjects) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">Next Achievement</h4>
                {achievements.find(a => !a.isUnlocked) && (
                  <div className="bg-neutral-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{achievements.find(a => !a.isUnlocked)?.icon}</span>
                      <div>
                        <p className="font-bold">{achievements.find(a => !a.isUnlocked)?.title}</p>
                        <p className="text-sm text-neutral-400">
                          {achievements.find(a => !a.isUnlocked)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="bg-neutral-700 p-2 rounded-lg">
                      <p className="text-sm">
                        Completed <span className="font-bold">{activity.project}</span>
                      </p>
                      <p className="text-xs text-neutral-400">{activity.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.isUnlocked
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-neutral-600 bg-neutral-700/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-bold">{achievement.title}</h4>
                    <p className="text-sm text-neutral-400">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="bg-neutral-700 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-bold">{activity.project}</p>
                    <p className="text-sm text-neutral-400">{activity.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            {Object.entries(skills).map(([skill, level]) => (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">{skill}</span>
                  <span className="text-neutral-400">{Math.round(level)}%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-full transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Add these new sections after the skills tab content */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documentation Section */}
              <div className="bg-neutral-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📚</span> Documentation
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: 'React Documentation', url: 'https://react.dev' },
                    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
                    { name: 'React Router', url: 'https://reactrouter.com' },
                    { name: 'Redux Toolkit', url: 'https://redux-toolkit.js.org' },
                  ].map(resource => (
                    <li key={resource.name}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {resource.name} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Video Tutorials */}
              <div className="bg-neutral-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🎥</span> Recommended Videos
                </h3>
                <ul className="space-y-3">
                  {[
                    'React Fundamentals',
                    'Hooks Deep Dive',
                    'State Management',
                    'Performance Optimization',
                  ].map(topic => (
                    <li key={topic} className="flex items-center gap-2">
                      <span className="text-neutral-400">▶</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Exercises */}
              <div className="bg-neutral-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>💪</span> Practice Exercises
                </h3>
                <ul className="space-y-3">
                  {[
                    'CodeSandbox Challenges',
                    'React Coding Exercises',
                    'Algorithm Practice',
                    'Component Building',
                  ].map(exercise => (
                    <li key={exercise} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>{exercise}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community Resources */}
              <div className="bg-neutral-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>👥</span> Community
                </h3>
                <ul className="space-y-3">
                  {[
                    'React Discord Server',
                    'Stack Overflow',
                    'Reddit r/reactjs',
                    'Dev.to React Community',
                  ].map(community => (
                    <li key={community} className="flex items-center gap-2">
                      <span className="text-purple-400">●</span>
                      <span>{community}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'study-plan' && (
          <div className="space-y-6">
            {/* Weekly Goals */}
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Weekly Learning Goals</h3>
              <div className="space-y-4">
                {[
                  { goal: 'Complete 2 projects', progress: 1 },
                  { goal: 'Watch 3 tutorial videos', progress: 2 },
                  { goal: 'Practice coding for 5 hours', progress: 3 },
                  { goal: 'Read documentation for 2 hours', progress: 1 },
                ].map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>{goal.goal}</span>
                      <span className="text-sm text-neutral-400">
                        {goal.progress}/
                        {goal.goal.match(/\d+/)[0]} completed
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-green-500 rounded-full h-full transition-all duration-500"
                        style={{
                          width: `${(goal.progress / goal.goal.match(/\d+/)[0]) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path Progress */}
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Learning Path Progress</h3>
              <div className="space-y-6">
                {[
                  { path: 'Fundamentals', progress: 80 },
                  { path: 'Advanced Concepts', progress: 40 },
                  { path: 'State Management', progress: 60 },
                  { path: 'Testing', progress: 20 },
                ].map((path, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{path.path}</span>
                      <span className="text-neutral-400">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-full transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Schedule */}
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Study Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { day: 'Monday', topic: 'React Basics', time: '2 hours' },
                  { day: 'Wednesday', topic: 'State Management', time: '1.5 hours' },
                  { day: 'Friday', topic: 'Project Work', time: '3 hours' },
                  { day: 'Weekend', topic: 'Practice & Review', time: '4 hours' },
                ].map((schedule, index) => (
                  <div key={index} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="font-bold text-blue-400">{schedule.day}</div>
                    <div>{schedule.topic}</div>
                    <div className="text-sm text-neutral-400">{schedule.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-neutral-700 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Recommended Next Steps</h3>
              <ul className="space-y-3">
                {[
                  'Complete the current project',
                  'Review React Hooks documentation',
                  'Practice component optimization',
                  'Start working on a personal project',
                ].map((step, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-yellow-400">→</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
