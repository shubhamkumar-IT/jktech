"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { ingestionService } from "../../../lib/mock-service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  RotateCw,
} from "lucide-react";

export default function IngestionsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [ingestions, setIngestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingRetry, setProcessingRetry] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchIngestions = async () => {
      try {
        const data = await ingestionService.getIngestions();
        setIngestions(data);
      } catch (error) {
        console.error("Error fetching ingestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchIngestions();
    }
  }, [isAuthenticated]);

  // Set up polling for in-progress ingestions
  useEffect(() => {
    let intervalId;

    if (ingestions.some((ing) => ing.status === "in-progress")) {
      intervalId = setInterval(async () => {
        try {
          const data = await ingestionService.getIngestions();
          setIngestions(data);
        } catch (error) {
          console.error("Error polling ingestions:", error);
        }
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [ingestions]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRetry = async (id) => {
    setProcessingRetry(true);

    try {
      await ingestionService.retryIngestion(id);

      // Update ingestion data
      const data = await ingestionService.getIngestions();
      setIngestions(data);

      toast.success("Ingestion retry initiated successfully");
    } catch (error) {
      console.error("Error retrying ingestion:", error);
      toast.error("Failed to retry ingestion");
    } finally {
      setProcessingRetry(false);
    }
  };

  // Filter ingestions based on search query
  const filteredIngestions = ingestions.filter((ing) =>
    ing.documentTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1 text-blue-600">
            <Clock className="h-4 w-4" />
            In Progress
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            Failed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getProgress = (ingestion) => {
    if (ingestion.status === "completed") {
      return 100;
    } else if (ingestion.status === "in-progress") {
      return (ingestion.processedPages / ingestion.totalPages) * 100;
    } else if (ingestion.status === "failed") {
      return (ingestion.processedPages / ingestion.totalPages) * 100;
    }
    return 0;
  };

  return (
    <div className="container py-8 px-4 md:px-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ingestion Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage document ingestion processes
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by document title..."
            className="pl-10 p-2 border rounded-md w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Ingestions table */}
        <div className="bg-white rounded-md border shadow-md mt-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Ingestion Processes</h2>
            <p className="text-sm text-gray-600">
              {filteredIngestions.length} ingestion
              {filteredIngestions.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Document</th>
                  <th className="px-4 py-2 text-left">Start Time</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Progress</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-gray-500 animate-spin mb-2" />
                        <p>Loading ingestion data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredIngestions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-500 mb-2" />
                        <p className="text-gray-500">
                          No ingestion processes found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIngestions.map((ing) => (
                    <tr key={ing.id} className="border-t">
                      <td className="px-4 py-2">
                        <div>
                          <span className="font-medium">
                            {ing.documentTitle}
                          </span>
                          <div className="text-xs text-gray-500">
                            {ing.processedPages} of {ing.totalPages} pages
                            processed
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(ing.startTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {getStatusBadge(ing.status)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-full max-w-xs">
                          <progress
                            className="w-full h-2 rounded-md"
                            value={getProgress(ing)}
                            max="100"
                            style={{
                              backgroundColor:
                                ing.status === "failed" ? "#FEE2E2" : "#D1FAE5",
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {ing.status === "in-progress" ? (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Processing...
                              </span>
                            ) : ing.status === "completed" ? (
                              `Completed in ${
                                ing.endTime
                                  ? Math.round(
                                      (new Date(ing.endTime) -
                                        new Date(ing.startTime)) /
                                        1000
                                    )
                                  : "N/A"
                              } seconds`
                            ) : ing.status === "failed" ? (
                              <span className="text-red-500">
                                {ing.error || "Processing failed"}
                              </span>
                            ) : (
                              "Unknown status"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {ing.status === "failed" && (
                          <button
                            onClick={() => handleRetry(ing.id)}
                            disabled={processingRetry}
                            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md flex items-center gap-1"
                          >
                            <RotateCw className="h-4 w-4" />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
