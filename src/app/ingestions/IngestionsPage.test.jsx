import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IngestionsPage from "../app/(dashboard)/ingestion/page"; // Update this path as per your project
import { useAuth } from "../../../lib/auth";
import { ingestionService } from "../../../lib/mock-service";
import { ToastContainer, toast } from "react-toastify";

// Mock dependencies
jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../lib/mock-service", () => ({
  ingestionService: {
    getIngestions: jest.fn(),
    retryIngestion: jest.fn(),
  },
}));

const mockIngestions = [
  {
    id: "1",
    documentTitle: "Test Document 1",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: "completed",
    processedPages: 10,
    totalPages: 10,
  },
  {
    id: "2",
    documentTitle: "Test Document 2",
    startTime: new Date().toISOString(),
    status: "failed",
    processedPages: 5,
    totalPages: 10,
    error: "Processing failed",
  },
];

describe("IngestionsPage", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    ingestionService.getIngestions.mockResolvedValue(mockIngestions);
  });

  it("renders ingestion table with data", async () => {
    render(
      <>
        <IngestionsPage />
        <ToastContainer />
      </>
    );

    expect(screen.getByText(/Ingestion Management/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search by document title/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
      expect(screen.getByText("Test Document 2")).toBeInTheDocument();
    });
  });

  it("filters ingestion results using search", async () => {
    render(<IngestionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Search by document title/i);
    fireEvent.change(input, { target: { value: "Document 2" } });

    expect(screen.queryByText("Test Document 1")).not.toBeInTheDocument();
    expect(screen.getByText("Test Document 2")).toBeInTheDocument();
  });

  it("shows retry button for failed ingestion and handles retry", async () => {
    ingestionService.retryIngestion.mockResolvedValue({});
    ingestionService.getIngestions.mockResolvedValue(mockIngestions);

    render(
      <>
        <IngestionsPage />
        <ToastContainer />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Document 2")).toBeInTheDocument();
    });

    const retryButton = screen.getByText("Retry");
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(ingestionService.retryIngestion).toHaveBeenCalledWith("2");
      expect(
        screen.getByText(/Ingestion retry initiated successfully/i)
      ).toBeInTheDocument();
    });
  });

  it("redirects to login if not authenticated", async () => {
    const mockPush = jest.fn();
    jest.mock("next/navigation", () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(<IngestionsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
