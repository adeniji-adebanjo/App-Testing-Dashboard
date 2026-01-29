"use client";

import { useState } from "react";
import { TestCase, TestStatus } from "@/types/test-case";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getStatusColor, cn } from "@/lib/utils";
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
        tc.id === editingId ? { ...tc, ...editData } : tc,
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
      tc.id === id ? { ...tc, status } : tc,
    );
    onUpdate(updated);
  };

  return (
    <div className="w-full">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {testCases.map((testCase) => (
          <Card
            key={testCase.id}
            className="border border-gray-100 shadow-sm overflow-hidden"
          >
            <CardHeader className="bg-gray-50/50 py-2.5 px-4 flex flex-row items-center justify-between space-y-0">
              <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">
                {testCase.testCaseId}
              </span>
              <Badge
                className={cn(
                  getStatusColor(testCase.status),
                  "text-[9px] px-2 py-0.5 font-black uppercase tracking-wider border-none",
                )}
              >
                {testCase.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">
                  Scenario
                </Label>
                <p className="text-[13px] font-bold text-gray-900 leading-snug mt-1">
                  {testCase.scenario}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">
                    Expected
                  </Label>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {testCase.expectedResult}
                  </p>
                </div>
                <div className="bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  <Label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">
                    Actual Result
                  </Label>
                  {editingId === testCase.id ? (
                    <input
                      type="text"
                      value={editData.actualResult || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          actualResult: e.target.value,
                        })
                      }
                      className="w-full mt-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  ) : (
                    <p className="text-[11px] text-gray-700 leading-relaxed">
                      {testCase.actualResult || "-"}
                    </p>
                  )}
                </div>
              </div>

              {editingId === testCase.id && (
                <div className="pt-2 space-y-4">
                  <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                    <Label className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mb-2 block text-center">
                      Update Status
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["pass", "fail", "pending", "blocked"].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setEditData({
                              ...editData,
                              status: status as TestStatus,
                            })
                          }
                          className={cn(
                            "py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            (editData.status || testCase.status) === status
                              ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                              : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">
                      Internal Comments
                    </Label>
                    <input
                      type="text"
                      value={editData.comments || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, comments: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Add testing notes..."
                    />
                  </div>
                </div>
              )}

              {testCase.comments && editingId !== testCase.id && (
                <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                  <Label className="text-[9px] font-black text-amber-600 uppercase tracking-[0.15em] mb-1 block">
                    Notes
                  </Label>
                  <p className="text-[11px] text-amber-900/70 italic leading-relaxed">
                    {testCase.comments}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-50 mt-2">
                {editingId === testCase.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[10px] h-9 px-4 font-bold text-gray-500"
                      onClick={cancelEdit}
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      className="text-[10px] h-9 px-6 font-black uppercase tracking-widest bg-gray-900"
                      onClick={saveEdit}
                    >
                      Save Results
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] h-8 px-4 gap-2 text-gray-600 border-gray-200 font-bold"
                    onClick={() => startEdit(testCase)}
                  >
                    <Edit size={12} className="text-primary" />
                    Edit Result
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Test ID
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Scenario
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Expected Result
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Actual Result
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Status
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Comments
              </th>
              <th className="p-3 text-left text-sm font-bold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase) => (
              <tr
                key={testCase.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-3 text-xs font-black text-gray-400 uppercase tracking-wider">
                  {testCase.testCaseId}
                </td>
                <td className="p-3 text-sm font-semibold text-gray-900">
                  {testCase.scenario}
                </td>
                <td className="p-3 text-xs text-gray-600 max-w-[200px]">
                  {testCase.expectedResult}
                </td>
                <td className="p-3 text-sm">
                  {editingId === testCase.id ? (
                    <input
                      type="text"
                      value={editData.actualResult || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          actualResult: e.target.value,
                        })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                      placeholder="Actual result..."
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
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
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
                <td className="p-3 text-xs">
                  {editingId === testCase.id ? (
                    <input
                      type="text"
                      value={editData.comments || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, comments: e.target.value })
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                      placeholder="Comments..."
                    />
                  ) : (
                    <span className="text-gray-500 italic">
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
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(testCase)}
                      className="h-8 w-8 text-gray-400 hover:text-primary"
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
    </div>
  );
}
