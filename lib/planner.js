export function generateStudyPlan(tasks, availableHoursPerDay = 4) {
  // Filter only pending tasks
  const pendingTasks = tasks.filter((t) => t.status === "pending");

  // Score each task based on priority + deadline urgency
  const scored = pendingTasks.map((task) => {
    const daysLeft = Math.ceil(
      (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    // Priority score
    const priorityScore =
      task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;

    // Urgency score — closer deadline = higher score
    const urgencyScore = daysLeft <= 1 ? 5 : daysLeft <= 3 ? 4 : daysLeft <= 7 ? 3 : daysLeft <= 14 ? 2 : 1;

    // Total score
    const totalScore = priorityScore + urgencyScore;

    // Recommended hours based on priority
    const recommendedHours =
      task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;

    return {
      ...task,
      daysLeft,
      totalScore,
      recommendedHours,
    };
  });

  // Sort by total score descending (highest priority first)
  scored.sort((a, b) => b.totalScore - a.totalScore);

  // Allocate tasks into daily schedule
  const plan = [];
  let remainingHours = availableHoursPerDay;
  let currentDay = [];
  let dayNumber = 1;

  for (const task of scored) {
    let hoursNeeded = task.recommendedHours;

    // If task fits in today
    if (hoursNeeded <= remainingHours) {
      currentDay.push({ ...task, allocatedHours: hoursNeeded });
      remainingHours -= hoursNeeded;
    } else {
      // Push current day and start new day
      if (currentDay.length > 0) {
        plan.push({ day: dayNumber, tasks: currentDay });
        dayNumber++;
      }
      currentDay = [{ ...task, allocatedHours: hoursNeeded }];
      remainingHours = availableHoursPerDay - hoursNeeded;
    }
  }

  // Push last day
  if (currentDay.length > 0) {
    plan.push({ day: dayNumber, tasks: currentDay });
  }

  return plan;
}