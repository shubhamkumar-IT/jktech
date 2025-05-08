"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { userService } from "../../../lib/mock-service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Header/Navigation";

export default function UsersPage() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // User form state
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [formProcessing, setFormProcessing] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
        toast.error(
          "Access Denied: Only administrators can access the user management page"
        );
      }
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setEditingUser(null);
      setName("");
      setEmail("");
      setRole("user");
    }
    setShowUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setShowUserDialog(false);
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("user");
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setFormProcessing(true);

    try {
      if (editingUser) {
        // Simulate updating user
        toast.success("User updated successfully");
      } else {
        // Simulate creating a new user
        toast.success("User created successfully");
      }
      handleCloseUserDialog();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    } finally {
      setFormProcessing(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
            Admin
          </span>
        );
      case "editor":
        return (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            Editor
          </span>
        );
      case "user":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">
            User
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
            {role}
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
            Inactive
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="container py-8 px-4 md:px-8">
        <ToastContainer />

        {/* Add User Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-gray-500">Manage users and assign roles</p>
          </div>

          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleOpenUserDialog()}
          >
            Add User
          </button>
        </div>

        {/* Modal Dialog for Add/Edit User */}
        {showUserDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <form onSubmit={handleSubmitUser}>
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter user name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter user email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium">
                      Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="user">User</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Role defines user permissions and access levels
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCloseUserDialog}
                    className="px-4 py-2 bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formProcessing}
                    className={`px-4 py-2 rounded-md ${
                      formProcessing ? "bg-gray-400" : "bg-blue-500 text-white"
                    }`}
                  >
                    {formProcessing
                      ? "Saving..."
                      : editingUser
                      ? "Update User"
                      : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mt-6">
          <input
            placeholder="Search users by name, email, or role..."
            className="pl-10 p-2 border rounded w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-md overflow-hidden mt-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="animate-spin h-6 w-6 text-gray-500 mb-2" />
                    <p>Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <p>No users found</p>
                    <button
                      className="text-blue-500"
                      onClick={() => handleOpenUserDialog()}
                    >
                      Add your first user
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4">{user.createdAt}</td>
                    <td className="p-4">{user.lastLogin}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                          onClick={() => handleOpenUserDialog(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
