"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import ObjectivesChecklist from "@/components/testing/ObjectivesChecklist";
import TestEnvironmentSetup from "@/components/testing/TestEnvironmentSetup";

export default function HomePage() {
  const stats = [
    {
      title: "Total Test Cases",
      value: "130+",
      icon: CheckCircle2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tests Passed",
      value: "0",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Tests Failed",
      value: "0",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Pending",
      value: "130+",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Testing Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage your testing progress for the Credit Bureau Report
          Management Web App
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Credit Bureau Report Management Web App Testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Document Version
              </p>
              <p className="mt-1 text-lg font-semibold">1.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Testing Phase</p>
              <Badge className="mt-1">In Progress</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Target Users</p>
              <p className="mt-1">
                Credit Underwriters, Analysts, Operations Team, Sales Team Leads
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tech Stack</p>
              <p className="mt-1">
                Next.js, TypeScript, PostgreSQL/MongoDB, Node.js/Django
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Objectives */}
      <ObjectivesChecklist />

      {/* Test Environment */}
      <TestEnvironmentSetup />
    </div>
  );
}
