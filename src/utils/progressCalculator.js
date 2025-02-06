export const calculateProjectProgress = (project, completedSteps = []) => {
  if (!project || !project.steps || project.steps.length === 0) return 0;
  return Math.round((completedSteps.length / project.steps.length) * 100);
}; 