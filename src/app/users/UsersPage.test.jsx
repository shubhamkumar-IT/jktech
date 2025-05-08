import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "./page";
import { useAuth } from "../../../lib/auth";
import { userService } from "../../../lib/mock-service";

jest.mock("../../../lib/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../lib/mock-service", () => ({
  userService: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

describe("UsersPage", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
      user: { name: "Test User", email: "test@user.com", picture: "" },
    });
  });

  test("should render the page correctly", () => {
    render(<UsersPage />);

    // Check if the title is rendered
    expect(screen.getByText("User Management")).toBeInTheDocument();

    // Check if the add user button is present
    expect(screen.getByText("Add User")).toBeInTheDocument();
  });

  test("should open modal and create a new user", async () => {
    // Mock successful user creation
    userService.createUser.mockResolvedValue({
      id: 1,
      name: "New User",
      email: "new@user.com",
      role: "user",
    });

    render(<UsersPage />);

    // Click on the Add User button to open the modal
    const addButton = screen.getByText("Add User");
    userEvent.click(addButton);

    // Fill in the modal form
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@user.com" },
    });
    fireEvent.change(screen.getByLabelText("Role"), {
      target: { value: "user" },
    });

    // Submit the form
    userEvent.click(screen.getByText("Add User"));

    // Wait for the success toast
    await waitFor(() =>
      expect(screen.getByText("User created successfully")).toBeInTheDocument()
    );
  });

  test("should edit an existing user", async () => {
    // Mock successful user update
    userService.updateUser.mockResolvedValue({
      id: 1,
      name: "Updated User",
      email: "updated@user.com",
      role: "user",
    });

    render(<UsersPage />);

    // Open the modal to edit a user
    const editButton = screen.getByText("Edit"); // Adjust according to button text in your code
    userEvent.click(editButton);

    // Fill in the modal form with updated data
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated User" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "updated@user.com" },
    });

    // Submit the form
    userEvent.click(screen.getByText("Update User"));

    // Wait for the success toast
    await waitFor(() =>
      expect(screen.getByText("User updated successfully")).toBeInTheDocument()
    );
  });

  test("should delete a user", async () => {
    // Mock successful user deletion
    userService.deleteUser.mockResolvedValue({});

    render(<UsersPage />);

    // Simulate clicking the delete button for a user
    const deleteButton = screen.getByText("Delete"); // Adjust according to your delete button
    userEvent.click(deleteButton);

    // Wait for the success toast
    await waitFor(() =>
      expect(screen.getByText("User deleted successfully")).toBeInTheDocument()
    );
  });

  test("should filter users based on search query", () => {
    render(<UsersPage />);

    // Search for a user by name
    const searchInput = screen.getByPlaceholderText(
      "Search users by name, email, or role..."
    );
    userEvent.type(searchInput, "Test User");

    // Check if the user appears in the filtered results
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  test("should show a loading state when users are being fetched", () => {
    // Simulate the loading state
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: true,
      user: { name: "Test User", email: "test@user.com" },
    });

    render(<UsersPage />);

    // Check if the loading spinner is displayed
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("should redirect to login if not authenticated", () => {
    // Mock user not authenticated
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });

    render(<UsersPage />);

    // Check if the user is redirected to login
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  test("should redirect to dashboard if user is not an admin", () => {
    // Mock user is authenticated but not an admin
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    });

    render(<UsersPage />);

    // Check if the user is redirected to the dashboard
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });
});
