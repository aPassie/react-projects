import { BarChart, Book, Trophy } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressTrackerProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  onProgressUpdate?: () => void;
}

const levelRequirements = {
  'beginner': { next: 'intermediate', required: 5 },
  'intermediate': { next: 'advanced', required: 5 },
  'advanced': { next: 'Expert', required: 5 },
  'Expert': { next: null, required: null },
};

const ProgressTracker = ({ level, onProgressUpdate }: ProgressTrackerProps) => {
  const { getUserProgress } = useAuth();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(0);
  const total = 5; // Total projects per level

  useEffect(() => {
    const fetchProgress = async () => {
      const userProgress = await getUserProgress();
      if (userProgress && userProgress[level]) {
        const levelProjects = userProgress[level];
        const completedCount = Object.values(levelProjects).filter(
          (project: any) => project.completed
        ).length;
        setCompleted(completedCount);
        setProgress((completedCount / total) * 100);
      }
    };

    fetchProgress();
  }, [getUserProgress, level]);

  const nextLevel = levelRequirements[level];
  const remainingForNextLevel = nextLevel?.required ? nextLevel.required - completed : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Progress Card */}
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <BarChart className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Completed Card */}
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Book className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-foreground">{completed} / {total}</p>
          </div>
        </CardContent>
      </Card>

      {/* Next Level Card */}
      <Card className="bg-card border-border shadow-lg">
        <CardContent className="pt-6 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Next Level</p>
            <p className="text-2xl font-bold text-foreground">
              {remainingForNextLevel > 0
                ? `${remainingForNextLevel} more to ${nextLevel.next}`
                : "Level Complete!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;