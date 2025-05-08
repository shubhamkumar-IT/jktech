// QAPage.test.js
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import userEvent from "@testing-library/user-event";
import QAPage from "./page";
import { useAuth } from "../../../lib/auth";
import { qaService } from "../../../lib/mock-service";

// Mocking necessary dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../lib/mock-service", () => ({
  qaService: {
    askQuestion: jest.fn(),
  },
}));

describe("QAPage", () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };

    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: "Test User", email: "test@user.com", picture: "" },
      logout: jest.fn(),
    });
  });

  test("should render the page correctly", () => {
    render(<QAPage />);

    // Check if the page title and description are displayed
    expect(screen.getByText(/Document Q&A/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Ask questions about your documents and get instant answers/i
      )
    ).toBeInTheDocument();
  });

  test("should handle the form submission correctly", async () => {
    // Mock successful response from the QA service
    qaService.askQuestion.mockResolvedValue({
      answer: "Sample Answer",
      sources: [],
    });

    render(<QAPage />);

    // Get the input and submit button
    const input = screen.getByPlaceholderText(
      /Ask a question about your documents.../i
    );
    const submitButton = screen.getByRole("button", { name: /Send/i });

    // User types a question
    userEvent.type(input, "What is the revenue for Q2?");
    expect(input).toHaveValue("What is the revenue for Q2?");

    // User submits the form
    userEvent.click(submitButton);

    // Wait for the response
    await waitFor(() =>
      expect(qaService.askQuestion).toHaveBeenCalledWith(
        "What is the revenue for Q2?"
      )
    );

    // Ensure the answer is displayed after API call
    expect(screen.getByText(/Sample Answer/i)).toBeInTheDocument();
  });

  test("should handle error correctly when API fails", async () => {
    // Mock an error response from the QA service
    qaService.askQuestion.mockRejectedValue(new Error("API Error"));

    render(<QAPage />);

    const input = screen.getByPlaceholderText(
      /Ask a question about your documents.../i
    );
    const submitButton = screen.getByRole("button", { name: /Send/i });

    // User types a question
    userEvent.type(input, "What is the revenue for Q2?");
    expect(input).toHaveValue("What is the revenue for Q2?");

    // User submits the form
    userEvent.click(submitButton);

    // Wait for error handling
    await waitFor(() =>
      expect(
        screen.getByText(
          /Sorry, there was an error processing your question. Please try again./i
        )
      ).toBeInTheDocument()
    );
  });

  test("should clear input field after submitting a question", async () => {
    qaService.askQuestion.mockResolvedValue({
      answer: "Sample Answer",
      sources: [],
    });

    render(<QAPage />);

    const input = screen.getByPlaceholderText(
      /Ask a question about your documents.../i
    );
    const submitButton = screen.getByRole("button", { name: /Send/i });

    // User types a question
    userEvent.type(input, "What is the revenue for Q2?");
    expect(input).toHaveValue("What is the revenue for Q2?");

    // User submits the form
    userEvent.click(submitButton);

    // Wait for the response
    await waitFor(() =>
      expect(qaService.askQuestion).toHaveBeenCalledWith(
        "What is the revenue for Q2?"
      )
    );

    // Ensure input is cleared
    expect(input).toHaveValue("");
  });

  test("should redirect to login if the user is not authenticated", () => {
    // Mock user is not authenticated
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    });

    render(<QAPage />);

    // Check if the router's push method is called (redirecting to login page)
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });
});
