import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Link, useLocation } from "react-router-dom";
import AdminUsers from "./AdminUsers";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

const dummyUsageData = [
  { day: "Mon", usage: 12 },
  { day: "Tue", usage: 20 },
  { day: "Wed", usage: 18 },
  { day: "Thu", usage: 23 },
  { day: "Fri", usage: 15 },
];

export default function AdminLayout() {
  const location = useLocation();
  const totalUsers = 120;
  const usageActivity = 45;

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F5]" style={openSansStyle}>
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col p-4 md:p-6 bg-[#D72638] text-[#FFD700]">
          <h1 className="text-2xl font-bold mb-8 md:mb-10" style={orbitronStyle}>Admin Panel</h1>
          <nav className="flex flex-col space-y-3 md:space-y-4">
            <Link
              to="/AdminDashboard"
              className={`px-3 py-2 rounded-lg hover:bg-black transition ${
                location.pathname === "/AdminDashboard" ? "bg-black text-[#FFD700]" : "text-[#FFD700]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/AdminUsers"
              className={`px-3 py-2 rounded-lg hover:bg-black transition ${
                location.pathname === "/AdminUsers" ? "bg-black text-[#FFD700]" : "text-[#FFD700]"
              }`}
            >
              Users
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {location.pathname === "/AdminDashboard" && (
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black" style={orbitronStyle}>Admin Analytics</h1>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="p-4 md:p-6 rounded-xl shadow-lg bg-[#FFD700] text-black" style={orbitronStyle}>
                  <h2 className="text-lg font-medium mb-1 md:mb-2">Total Users</h2>
                  <p className="text-2xl md:text-4xl font-bold">{totalUsers}</p>
                </div>
                <div
                  className="p-4 md:p-6 rounded-xl shadow-lg border-2"
                  style={{ backgroundColor: "#F5F5F5", color: "#D72638", borderColor: "#D72638", ...orbitronStyle }}
                >
                  <h2 className="text-lg font-medium mb-1 md:mb-2">Usage Activity</h2>
                  <p className="text-2xl md:text-4xl font-bold">{usageActivity}</p>
                </div>
                <div
                  className="p-4 md:p-6 rounded-xl shadow-lg border-2"
                  style={{ backgroundColor: "#F5F5F5", color: "#000000", borderColor: "#FFD700", ...orbitronStyle }}
                >
                  <h2 className="text-lg font-medium mb-1 md:mb-2">Placeholder Metric</h2>
                  <p className="text-2xl md:text-4xl font-bold">99</p>
                </div>
              </div>

              {/* Chart */}
              <div className="p-4 md:p-6 rounded-xl shadow-lg bg-[#F5F5F5]">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-black" style={orbitronStyle}>
                  Weekly Usage Chart
                </h2>
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dummyUsageData}>
                      <CartesianGrid stroke="#D72638" strokeDasharray="5 5" />
                      <XAxis dataKey="day" stroke="#000000" />
                      <YAxis stroke="#000000" />
                      <Tooltip contentStyle={{ backgroundColor: "#FFD700", borderRadius: "6px", color: "#000000" }} />
                      <Line type="monotone" dataKey="usage" stroke="#D72638" strokeWidth={3} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {location.pathname === "/AdminUsers" && <AdminUsers />}
        </div>
      </div>
    </>
  );
}
