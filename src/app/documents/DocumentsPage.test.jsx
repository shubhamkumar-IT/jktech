/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentsPage from "./page"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { documentService } from "../../../lib/mock-service";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Auth hook
jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

// Mock document service
jest.mock("../../../lib/mock-service", () => ({
  documentService: {
    getDocuments: jest.fn(),
    uploadDocument: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));

describe("DocumentsPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: pushMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("redirects to login if not authenticated", async () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  test("shows loading spinner while documents are loading", async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    documentService.getDocuments.mockImplementation(
      () => new Promise(() => {}) // Simulate never resolving
    );

    render(<DocumentsPage />);

    expect(screen.getByText(/loading documents/i)).toBeInTheDocument();
  });

  test("displays documents when loaded", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { name: "John Doe" },
    });

    documentService.getDocuments.mockResolvedValue([
      {
        id: "1",
        title: "Test Document",
        type: "PDF",
        size: "500 KB",
        uploadedBy: "John Doe",
        uploadDate: "2025-05-06",
        status: "processed",
      },
    ]);

    render(<DocumentsPage />);

    expect(await screen.findByText("Test Document")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  test("opens upload dialog when button clicked", () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(<DocumentsPage />);

    const uploadButton = screen.getByRole("button", {
      name: /upload document/i,
    });
    fireEvent.click(uploadButton);

    expect(screen.getByText(/upload document/i)).toBeInTheDocument();
  });

  test("deletes a document when delete icon is clicked", async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { name: "John Doe" },
    });

    documentService.getDocuments.mockResolvedValue([
      {
        id: "1",
        title: "Test Document",
        type: "PDF",
        size: "500 KB",
        uploadedBy: "John Doe",
        uploadDate: "2025-05-06",
        status: "processed",
      },
    ]);

    documentService.deleteDocument.mockResolvedValue({});

    render(<DocumentsPage />);

    const deleteButton = await screen.findByRole("button", { hidden: true }); // Icon button
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(documentService.deleteDocument).toHaveBeenCalledWith("1");
    });
  });
});
