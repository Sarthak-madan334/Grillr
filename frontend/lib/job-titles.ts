export const JOB_TITLE_SUGGESTIONS = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "Embedded Software Engineer",
  "Site Reliability Engineer",
  "DevOps Engineer",
  "Platform Engineer",
  "QA Engineer",
  "Test Automation Engineer",
  "Security Engineer",
  "Cloud Engineer",
  "Systems Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI/ML Research Engineer",
  "Firmware Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Intelligence Analyst",
  "Research Scientist",
  "Product Manager",
  "Technical Product Manager",
  "UI/UX Designer",
  "Product Designer",
  "UX Researcher",
  "Engineering Manager",
  "Technical Lead",
  "Director of Engineering",
  "VP of Engineering",
  "CTO",
  "Solutions Architect",
  "Technical Writer",
  "Developer Advocate",
  "IT Support Engineer",
  "Database Administrator",
] as const;

export function filterJobTitles(query: string, limit = 8): string[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const words = normalizedQuery.split(/\s+/);
  return JOB_TITLE_SUGGESTIONS
    .map((title, index) => {
      const normalizedTitle = title.toLowerCase();
      const startsWithQuery = normalizedTitle.startsWith(normalizedQuery);
      const containsQuery = normalizedTitle.includes(normalizedQuery);
      const matchesAllWords = words.every((word) => normalizedTitle.includes(word));
      const score = startsWithQuery ? 0 : matchesAllWords ? 1 : containsQuery ? 2 : 3;
      return { title, index, score };
    })
    .filter(({ score }) => score < 3)
    .sort((left, right) => left.score - right.score || left.index - right.index)
    .slice(0, limit)
    .map(({ title }) => title);
}
