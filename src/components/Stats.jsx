import React from "react";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function Stats() {
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <section className="py-8 px-4 md:py-12 max-w-4xl mx-auto" style={openSansStyle}>
        <div className="bg-white shadow-md rounded-lg grid grid-cols-1 md:grid-cols-3 gap-6 text-center p-6">
          
          {/* Stat 1 */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-red-600" style={orbitronStyle}>
              +7
            </h3>
            <p className="text-sm md:text-base text-gray-600" style={openSansStyle}>
              New users per month
            </p>
          </div>

          {/* Stat 2 */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-red-600" style={orbitronStyle}>
              23
            </h3>
            <p className="text-sm md:text-base text-gray-600" style={openSansStyle}>
              Active Users
            </p>
          </div>

          {/* Stat 3 */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-red-600" style={orbitronStyle}>
              98%
            </h3>
            <p className="text-sm md:text-base text-gray-600" style={openSansStyle}>
              Satisfied Customers
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
