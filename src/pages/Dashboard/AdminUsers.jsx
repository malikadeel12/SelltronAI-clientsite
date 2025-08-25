// src/pages/AdminUsers.jsx
import React, { useState } from "react";

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

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="p-3 md:p-6" style={{ backgroundColor: "#F5F5F5", ...openSansStyle }}>
        <h1
          className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
          style={{ color: "#000000", ...orbitronStyle }}
        >
          Users List
        </h1>

        <div className="overflow-x-auto rounded-xl shadow-lg" style={{ backgroundColor: "#F5F5F5" }}>
          <table className="min-w-full border-collapse text-sm md:text-base">
            <thead>
              <tr style={{ backgroundColor: "#FFD700" }}>
                <th className="py-3 px-2 sm:px-4 text-left text-black uppercase font-semibold">ID</th>
                <th className="py-3 px-2 sm:px-4 text-left text-black uppercase font-semibold">Name</th>
                <th className="py-3 px-2 sm:px-4 text-left text-black uppercase font-semibold">Email</th>
                <th className="py-3 px-2 sm:px-4 text-left text-black uppercase font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b transition-all duration-200 hover:bg-gray-50"
                  style={{ backgroundColor: index % 2 === 0 ? "#F5F5F5" : "#FFFFFF" }}
                >
                  <td className="py-2 px-2 sm:px-4">{user.id}</td>
                  <td className="py-2 px-2 sm:px-4">{user.name}</td>
                  <td className="py-2 px-2 sm:px-4">{user.email}</td>
                  <td className="py-2 px-2 sm:px-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="w-full sm:w-auto px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      style={{ backgroundColor: "#FFD700", color: "#000000", ...orbitronStyle }}
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
    </>
  );
}
