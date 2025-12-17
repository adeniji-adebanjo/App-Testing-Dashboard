"use client";

import { useState } from "react";
import { TestCase, TestStatus } from "@/types/test-case";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";
import { Edit, CheckCircle2, XCircle, Clock } from "lucide-react";

interface TestCaseTableProps {
  testCases: TestCase[];
  onUpdate: (testCases: TestCase[]) => void;
}

export default function TestCaseTable({
  testCases,
  onUpdate,
}: TestCaseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TestCase>>({});

  const startEdit = (testCase: TestCase) => {
    setEditingId(testCase.id);
    setEditData(testCase);
  };

  const saveEdit = () => {
    if (editingId) {
      const updated = testCases.map((tc) =>
        tc.id === editingId ? { ...tc, ...editData } : tc
      );
      onUpdate(updated);
      setEditingId(null);
      setEditData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const updateStatus = (id: string, status: TestStatus) => {
    const updated = testCases.map((tc) =>
      tc.id === id ? { ...tc, status } : tc
    );
    onUpdate(updated);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Test ID
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Scenario
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Expected Result
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Actual Result
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Comments
            </th>
            <th className="p-3 text-left text-sm font-semibold text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => (
            <tr
              key={testCase.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="p-3 text-sm font-medium text-gray-900">
                {testCase.testCaseId}
              </td>
              <td className="p-3 text-sm text-gray-700">{testCase.scenario}</td>
              <td className="p-3 text-sm text-gray-600">
                {testCase.expectedResult}
              </td>
              <td className="p-3 text-sm">
                {editingId === testCase.id ? (
                  <input
                    type="text"
                    value={editData.actualResult || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, actualResult: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Enter actual result..."
                  />
                ) : (
                  <span className="text-gray-700">
                    {testCase.actualResult || "-"}
                  </span>
                )}
              </td>
              <td className="p-3">
                {editingId === testCase.id ? (
                  <select
                    value={editData.status || testCase.status}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        status: e.target.value as TestStatus,
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                    <option value="blocked">Blocked</option>
                  </select>
                ) : (
                  <Badge className={getStatusColor(testCase.status)}>
                    {testCase.status === "pass" && (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    )}
                    {testCase.status === "fail" && (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {testCase.status === "pending" && (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {testCase.status.charAt(0).toUpperCase() +
                      testCase.status.slice(1)}
                  </Badge>
                )}
              </td>
              <td className="p-3 text-sm">
                {editingId === testCase.id ? (
                  <input
                    type="text"
                    value={editData.comments || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, comments: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="Add comments..."
                  />
                ) : (
                  <span className="text-gray-600">
                    {testCase.comments || "-"}
                  </span>
                )}
              </td>
              <td className="p-3">
                {editingId === testCase.id ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(testCase)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
