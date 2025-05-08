"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { documentService, ingestionService } from "../../../lib/mock-service";
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  PieChart,
  BarChart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart as ReChartPie,
  Pie,
  Cell,
  BarChart as ReChartBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Header from "../../components/Header/Navigation";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [ingestions, setIngestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsData, ingData] = await Promise.all([
          documentService.getDocuments(),
          ingestionService.getIngestions(),
        ]);
        setDocuments(docsData);
        setIngestions(ingData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Calculate document statistics
  const totalDocuments = documents.length;
  const processedDocs = documents.filter(
    (doc) => doc.status === "processed"
  ).length;
  const processingDocs = documents.filter(
    (doc) => doc.status === "processing"
  ).length;
  const failedDocs = documents.filter((doc) => doc.status === "failed").length;

  // Data for pie chart
  const pieData = [
    { name: "Processed", value: processedDocs, color: "#10b981" },
    { name: "Processing", value: processingDocs, color: "#3b82f6" },
    { name: "Failed", value: failedDocs, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Create document type distribution data
  const docTypeCount = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(docTypeCount).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Recent activities from ingestions
  const recentActivities = [...ingestions]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 5);

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-500">
                Here's an overview of your document management system
              </p>
            </div>
            <Link href="/documents">
              <button className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                <Upload className="h-4 w-4" />
                Upload Document
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Total Documents</div>
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-gray-500">
                {processedDocs} processed, {processingDocs} processing
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Processing Rate</div>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">
                {totalDocuments > 0
                  ? Math.round((processedDocs / totalDocuments) * 100)
                  : 0}
                %
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      totalDocuments > 0
                        ? (processedDocs / totalDocuments) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Failed Documents</div>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold">{failedDocs}</div>
              <p className="text-xs text-gray-500">
                {failedDocs > 0 ? "Action required" : "No failed documents"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Active Users</div>
                <Users className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-gray-500">1 admin, 4 regular users</p>
            </div>
          </div>

          {/* Charts and Recent Activities */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Document Status Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
              <div className="text-base font-medium">Document Status</div>
              <p className="text-sm text-gray-500 mb-2">
                Distribution of document processing status
              </p>
              <div className="h-[240px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartPie data={pieData}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </ReChartPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No document data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Types Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-3">
              <div className="text-base font-medium">Document Types</div>
              <p className="text-sm text-gray-500 mb-2">
                Distribution of document formats
              </p>
              <div className="h-[240px]">
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartBar data={barData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--chart-1))"
                        radius={[4, 4, 0, 0]}
                      />
                    </ReChartBar>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No document data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
              <div className="text-base font-medium">Recent Activities</div>
              <p className="text-sm text-gray-500 mb-2">
                Latest document processing activities
              </p>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {activity.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      )}
                      {activity.status === "in-progress" && (
                        <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      {activity.status === "failed" && (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {activity.documentTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.status === "completed" &&
                            "Processing completed"}
                          {activity.status === "in-progress" &&
                            "Currently processing"}
                          {activity.status === "failed" && "Processing failed"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center">
                    <p className="text-gray-500">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-blue-50 border-blue-200 p-4 rounded-lg">
              <div className="text-base font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span>Document Management</span>
              </div>
              <p className="text-sm mb-4">
                Upload, organize, and manage all your documents in one place.
              </p>
              <Link href="/documents">
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                  Manage Documents
                </button>
              </Link>
            </div>

            <div className="bg-purple-50 border-purple-200 p-4 rounded-lg">
              <div className="text-base font-medium flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Ask Questions</span>
              </div>
              <p className="text-sm mb-4">
                Get instant answers from your documents using our Q&A system.
              </p>
              <Link href="/qa">
                <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600">
                  Go to Q&A
                </button>
              </Link>
            </div>

            <div className="bg-emerald-50 border-emerald-200 p-4 rounded-lg">
              <div className="text-base font-medium flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Ingestion Status</span>
              </div>
              <p className="text-sm mb-4">
                Monitor and manage the processing status of your document
                ingestion.
              </p>
              <Link href="/ingestions">
                <button className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600">
                  View Ingestions
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
