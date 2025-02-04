import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProjectProgress {
  completed: boolean;
  completedAt: string;
}

interface LevelProgress {
  [projectId: string]: ProjectProgress;
}

interface UserProgress {
  beginner: LevelProgress;
  intermediate: LevelProgress;
  advanced: LevelProgress;
}

export const ProgressTracker = () => {
  const { getUserProgress } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      const userProgress = await getUserProgress();
      setProgress(userProgress);
    };
    fetchProgress();
  }, [getUserProgress, refreshKey]);

  const handleProgressUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const calculateProgress = (level: keyof UserProgress) => {
    if (!progress) return 0;
    const levelProjects = progress[level];
    const completedProjects = Object.values(levelProjects).filter(
      (project) => project.completed
    ).length;
    return (completedProjects / 5) * 100;
  };

  if (!progress) return null;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Beginner Level */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Beginner</h3>
            <Progress value={calculateProgress('beginner')} className="h-2" />
            <ProgressTracker level="beginner" onProgressUpdate={handleProgressUpdate} />
          </div>

          {/* Intermediate Level */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Intermediate</h3>
            <Progress value={calculateProgress('intermediate')} className="h-2" />
            <ProgressTracker level="intermediate" onProgressUpdate={handleProgressUpdate} />
          </div>

          {/* Advanced Level */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Advanced</h3>
            <Progress value={calculateProgress('advanced')} className="h-2" />
            <ProgressTracker level="advanced" onProgressUpdate={handleProgressUpdate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
