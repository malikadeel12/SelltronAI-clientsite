// src/pages/AdminUsers.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Font styles
const orbitronStyle = { fontFamily: "'Orbitron', sans-serif", fontWeight: 600 };
const openSansStyle = { fontFamily: "'Open Sans', sans-serif" };

const dummyUsers = [
  { id: 1, name: "Alice", email: "alice@mail.com" },
  { id: 2, name: "Bob", email: "bob@mail.com" },
  { id: 3, name: "Charlie", email: "charlie@mail.com" },
  { id: 4, name: "David", email: "david@mail.com" },
  { id: 5, name: "Eve", email: "eve@mail.com" },
  { id: 6, name: "Frank", email: "frank@mail.com" },
  { id: 7, name: "Grace", email: "grace@mail.com" },
  { id: 8, name: "Hannah", email: "hannah@mail.com" },
  { id: 9, name: "Ivan", email: "ivan@mail.com" },
  { id: 10, name: "Judy", email: "judy@mail.com" },
  { id: 11, name: "Kevin", email: "kevin@mail.com" },
  { id: 12, name: "Laura", email: "laura@mail.com" },
  { id: 13, name: "Mike", email: "mike@mail.com" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(dummyUsers);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteUser = () => {
    setUsers(users.filter((user) => user.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signup");
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F5]"
        style={openSansStyle}
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col p-4 md:p-6 bg-[#f5f5f5] text-[#000000] shadow-lg">
          <div>
            <h1
              className="text-2xl font-bold mb-8 md:mb-10 text-[#D72638]"
              style={orbitronStyle}
            >
              Admin Panel
            </h1>
            <nav className="flex flex-col space-y-3 md:space-y-4">
              <Link
                to="/AdminDashboard"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname === "/AdminDashboard"
                    ? "bg-[#FFD700] text-[#000000] font-semibold"
                    : "hover:bg-[#f5f5f5]"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/AdminUsers"
                className={`px-3 py-2 rounded-lg transition ${
                  location.pathname === "/AdminUsers"
                    ? "bg-[#FFD700] text-[#000000] font-semibold"
                    : "hover:bg-[#f5f5f5]"
                }`}
              >
                Users
              </Link>

              {/* Logout button placed right under links */}
              <button
                onClick={handleLogout}
                className="mt-4 px-4 py-2 cursor-pointer rounded-lg bg-[#FFD700] text-[#000000] font-semibold shadow hover:shadow-md transition"
                style={orbitronStyle}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 md:p-6">
          <h1
            className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
            style={{ color: "#000000", ...orbitronStyle }}
          >
            Users List
          </h1>

          <div
            className="overflow-x-auto rounded-xl shadow-lg"
            style={{ backgroundColor: "#F5F5F5" }}
          >
            <table className="min-w-full border-collapse text-sm md:text-base">
              <thead>
                <tr style={{ backgroundColor: "#FFD700" }}>
                  <th className="py-3 px-2 sm:px-4 text-left text-[#000000] uppercase font-semibold">
                    ID
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left text-[#000000] uppercase font-semibold">
                    Name
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left text-[#000000] uppercase font-semibold">
                    Email
                  </th>
                  <th className="py-3 px-2 sm:px-4 text-left text-[#000000] uppercase font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b transition-all duration-200 hover:bg-[#f5f5f5]"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#F5F5F5" : "#FFFFFF",
                    }}
                  >
                    <td className="py-2 px-2 sm:px-4">{user.id}</td>
                    <td className="py-2 px-2 sm:px-4">{user.name}</td>
                    <td className="py-2 px-2 sm:px-4">{user.email}</td>
                    <td className="py-2 px-2 sm:px-4">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-full cursor-pointer sm:w-auto px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: "#FFD700",
                          color: "#000000",
                          ...orbitronStyle,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000] bg-opacity-50 z-50">
          <div className="bg-[#f5f5f5] rounded-xl shadow-lg p-6 w-80">
            <h2
              className="text-lg font-bold mb-4 text-center"
              style={orbitronStyle}
            >
              Confirm Deletion
            </h2>
            <p className="text-[#000000] mb-6 text-center">
              Are you sure you want to delete this user?
            </p>
            <div className="flex justify-between">
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-lg cursor-pointer font-semibold"
                style={{
                  backgroundColor: "#FFD700",
                  color: "#000000",
                  ...orbitronStyle,
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 cursor-pointer py-2 rounded-lg bg-[#f5f5f5] hover:bg-[#f5f5f5] font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
