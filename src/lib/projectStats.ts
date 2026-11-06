import { ProjectStats } from "@/types/project";
import { TestCase, Defect } from "@/types/test-case";

// Pure stats calculation shared by the client (getProjectStats) and the
// server share route, so both report identical numbers.
export function computeProjectStats(
  testCases: TestCase[],
  defects: Defect[],
): ProjectStats {
  const passed = testCases.filter((tc) => tc.status === "pass").length;
  const failed = testCases.filter((tc) => tc.status === "fail").length;
  const pending = testCases.filter((tc) => tc.status === "pending").length;
  const blocked = testCases.filter((tc) => tc.status === "blocked").length;
  const total = testCases.length;

  const defectsOpen = defects.filter(
    (d) => d.status === "open" || d.status === "in-progress",
  ).length;
  const defectsClosed = defects.filter(
    (d) => d.status === "resolved" || d.status === "closed",
  ).length;

  return {
    totalTestCases: total,
    passed,
    failed,
    pending,
    blocked,
    defectsOpen,
    defectsClosed,
    passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}
