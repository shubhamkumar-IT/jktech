import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "../signup/page"; 
import { useAuth } from "../../../lib/auth";
import { useRouter } from "next/navigation";

jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("SignupPage", () => {
  const mockRegister = jest.fn();
  const mockLoginWithGoogle = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      register: mockRegister,
      loginWithGoogle: mockLoginWithGoogle,
    });

    useRouter.mockReturnValue({
      push: mockPush,
    });

    jest.clearAllMocks();
  });

  it("renders the signup form correctly", () => {
    render(<SignupPage />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("******")).toBeInTheDocument();
  });

  it("shows an error if password is too short", async () => {
    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("******"), {
      target: { value: "123" }, 
    });

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Password must be at least 6 characters")).toBeInTheDocument();
  });

  it("calls register function with valid inputs", async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByPlaceholderText("name@example.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("******"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("Test User", "test@example.com", "password123");
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("calls loginWithGoogle on Google signup button click", async () => {
    mockLoginWithGoogle.mockResolvedValue({ success: true });

    render(<SignupPage />);

    fireEvent.click(screen.getByRole("button", { name: /google/i }));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
