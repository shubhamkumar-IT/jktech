import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "./page"; // Adjust path as needed
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { documentService, ingestionService } from "../../../lib/mock-service";
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  delete global.ResizeObserver;
});

describe("DashboardPage", () => {
  it("shows empty state when no documents or ingestions", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      const emptyStates = screen.getAllByText("No document data available");
      expect(emptyStates.length).toBeGreaterThanOrEqual(1);
    });
  });
});
// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth
jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

// Mock services
jest.mock("../../../lib/mock-service", () => ({
  documentService: {
    getDocuments: jest.fn(),
  },
  ingestionService: {
    getIngestions: jest.fn(),
  },
}));

describe("DashboardPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push });
  });

  it("redirects to login if user is not authenticated", () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    render(<DashboardPage />);
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("renders dashboard with user and data", async () => {
    useAuth.mockReturnValue({
      user: { name: "Alice" },
      isAuthenticated: true,
      loading: false,
    });

    documentService.getDocuments.mockResolvedValue([
      { status: "processed", type: "pdf" },
      { status: "failed", type: "doc" },
    ]);

    ingestionService.getIngestions.mockResolvedValue([
      { id: "1", status: "completed", startTime: new Date().toISOString() },
    ]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Alice/i)).toBeInTheDocument();
      expect(screen.getByText("Total Documents")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // 1 failed doc
    });
  });

  it("shows empty state when no documents or ingestions", async () => {
    useAuth.mockReturnValue({
      user: { name: "Bob" },
      isAuthenticated: true,
      loading: false,
    });

    documentService.getDocuments.mockResolvedValue([]);
    ingestionService.getIngestions.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No document data available")
      ).toBeInTheDocument();
    });
  });
});
