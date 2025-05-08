"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { documentService } from "../../../lib/mock-service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  Upload,
  Trash,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Header from "../../components/Header/Navigation";

export default function DocumentsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Upload form state
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      // Convert to appropriate size format
      const size = file.size;
      const formatSize =
        size < 1024 * 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${(size / (1024 * 1024)).toFixed(1)} MB`;
      setFileSize(formatSize);

      // Set a default title based on filename without extension
      const defaultTitle = file.name.split(".").slice(0, -1).join(".");
      setTitle(defaultTitle);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      // Convert to appropriate size format
      const size = file.size;
      const formatSize =
        size < 1024 * 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${(size / (1024 * 1024)).toFixed(1)} MB`;
      setFileSize(formatSize);

      // Set a default title based on filename without extension
      const defaultTitle = file.name.split(".").slice(0, -1).join(".");
      setTitle(defaultTitle);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getFileTypeFromName = (filename) => {
    const extension = filename.split(".").pop().toUpperCase();
    return extension;
  };

  const handleUpload = async () => {
    if (!title || !fileName) {
      toast.error("Please provide a title and select a file");
      return;
    }

    setUploading(true);

    try {
      const newDocument = {
        title,
        type: getFileTypeFromName(fileName),
        size: fileSize,
        uploadedBy: user.name,
      };

      const result = await documentService.uploadDocument(newDocument);

      // Update documents list
      setDocuments((prev) => [...prev, result]);

      toast.success("Document uploaded successfully");

      // Reset form
      setTitle("");
      setFileName("");
      setFileSize("");
      setShowUploadDialog(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "processed":
        return (
          <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded">
            <CheckCircle className="h-4 w-4" />
            Processed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-100 px-2 py-1 rounded">
            <Clock className="h-4 w-4" />
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded">
            <AlertTriangle className="h-4 w-4" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-gray-500">Upload and manage your documents</p>
            </div>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="h-5 w-5" />
              Upload Document
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents by title or type..."
              className="pl-10 py-2 px-4 border border-gray-300 rounded w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Documents table */}
          <div className="bg-white shadow-md rounded-lg">
            <div className="border-b p-4">
              <h2 className="text-xl">All Documents</h2>
              <p className="text-gray-500">
                {filteredDocuments.length} document
                {filteredDocuments.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="overflow-x-auto p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mb-2" />
                  <p>Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex justify-center items-center py-8 text-gray-400">
                  <FileText className="h-10 w-10 mb-4" />
                  <p>No documents found</p>
                  <button
                    className="mt-4 text-blue-600 hover:underline"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    Upload your first document
                  </button>
                </div>
              ) : (
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Size</th>
                      <th className="p-2 text-left">Uploaded By</th>
                      <th className="p-2 text-left">Upload Date</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-2">{doc.title}</td>
                        <td className="p-2">{doc.type}</td>
                        <td className="p-2">{doc.size}</td>
                        <td className="p-2">{doc.uploadedBy}</td>
                        <td className="p-2">{doc.uploadDate}</td>
                        <td className="p-2">{getStatusBadge(doc.status)}</td>
                        <td className="p-2">
                          <button
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Upload Dialog */}
          {showUploadDialog && (
            <div
              className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50 flex justify-center items-center"
              onClick={() => setShowUploadDialog(false)}
            >
              <div
                className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div
                    className="border border-dashed p-4 rounded-lg text-center text-gray-500 cursor-pointer"
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                  >
                    <Upload className="h-10 w-10 mb-4" />
                    <p>{fileName ? fileName : "Drag and drop a file here"}</p>
                    {fileName && <p>{fileSize}</p>}
                    <input
                      type="file"
                      className="hidden"
                      accept="application/pdf,image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="bg-gray-300 px-4 py-2 rounded"
                      onClick={() => setShowUploadDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ToastContainer />
      </div>
    </>
  );
}
