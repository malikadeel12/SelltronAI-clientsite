import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import contactImg from "../../assets/images/image.png";

// Icons for Contact Cards
import contacticon1 from "../../assets/icons/contacticon1.png";
import contacticon2 from "../../assets/icons/contacticon2.png";
import contacticon3 from "../../assets/icons/contacticon3.png";

// Icons for Offices
import contacticon4 from "../../assets/icons/contacticon4.png";
import contacticon5 from "../../assets/icons/contacticon5.png";
import contacticon6 from "../../assets/icons/contacticon6.png";

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function ContactPage() {
  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="bg-gray-50 min-h-screen flex flex-col" style={openSansStyle}>
        {/* Navbar */}
        <Navbar />

        {/* Heading Section */}
        <section className="text-center py-10 px-4 sm:px-6">
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4"
            style={orbitronStyle}
          >
            Get in Touch with Sell Predator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
            Have a question or need support? Fill in the form below and our team
            will get back to you shortly.
          </p>
        </section>

        {/* Form + Image Section */}
        <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-stretch">
          {/* Left: Form */}
          <form
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 flex flex-col w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="border rounded-md p-3 w-full text-sm sm:text-base"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border rounded-md p-3 w-full text-sm sm:text-base"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="border rounded-md p-3 w-full text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="Subject: Question about pricing"
              className="border rounded-md p-3 w-full text-sm sm:text-base"
            />

            {/* Services Tags */}
            <div className="flex flex-wrap gap-2">
              {[
                "Sales Inquiry",
                "Partnership Opportunities",
                "Technical Support",
                "Billing & Payments",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full cursor-pointer hover:bg-yellow-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Message */}
            <textarea
              rows="4"
              placeholder="Add Text"
              className="border rounded-md p-3 w-full text-sm sm:text-base"
            ></textarea>

            {/* Checkbox */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the Terms of Service and Privacy Policy.
              </label>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="bg-yellow-400 text-black px-4 sm:px-6 py-2 rounded-full hover:bg-yellow-500 text-sm sm:text-base"
            >
              Send Message
            </button>
          </form>

          {/* Right: Illustration */}
          <div className="flex justify-center items-center w-full">
            <img
              src={contactImg}
              alt="Contact"
              className="w-full h-full object-contain max-w-sm sm:max-w-md"
            />
          </div>
        </section>

        {/* Contact Cards */}
        <section className="max-w-4xl w-full mx-auto px-4 sm:px-6 mt-8 sm:mt-10">
          <div className="bg-white shadow-md rounded-lg flex flex-col md:flex-row text-center w-full overflow-hidden">
            {[
              {
                icon: contacticon1,
                title: "Sales and Business",
                email: "sales@sellpredator.com",
              },
              {
                icon: contacticon2,
                title: "Partners",
                email: "partners@sellpredator.com",
              },
              {
                icon: contacticon3,
                title: "Customer Support",
                email: "support@sellpredator.com",
              },
            ].map((c, i) => (
              <div
                key={i}
                className={`flex-1 p-4 sm:p-6 flex flex-col items-center ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-gray-200" : ""
                }`}
              >
                <img
                  src={c.icon}
                  alt={c.title}
                  className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3"
                />
                <h3
                  className="font-semibold text-sm sm:text-base"
                  style={orbitronStyle}
                >
                  {c.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
                  {c.email}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Offices Section */}
        <section className="text-center py-10 sm:py-12 px-4 sm:px-6">
          <p className="text-purple-600 text-xs sm:text-sm mb-2">Our Offices</p>
          <h2
            className="text-lg sm:text-2xl md:text-3xl font-bold mb-4"
            style={orbitronStyle}
          >
            Connect With Sell Predator – Wherever You Are
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base">
            Our AI platform is available worldwide. Reach out to our team through
            our main contact points.
          </p>

          {/* Offices Grid */}
          <div className="bg-white shadow-md rounded-lg max-w-6xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 text-center p-6 sm:p-8 mt-6 sm:mt-8 gap-6">
            {[
              {
                icon: contacticon4,
                title: "Global Support",
                email: "support@sellpredator.com",
                phone: "+XX-XXXXX-XXXXX",
              },
              {
                icon: contacticon5,
                title: "Sales & Partnerships",
                email: "sales@sellpredator.com",
                phone: "+XX-XXXXX-XXXXX",
              },
              {
                icon: contacticon6,
                title: "Technical Support",
                email: "tech@sellpredator.com",
                phone: "+XX-XXXXX-XXXXX",
              },
            ].map((o, i) => (
              <div key={i} className="flex flex-col items-center px-2 sm:px-4">
                <img
                  src={o.icon}
                  alt={o.title}
                  className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3"
                />
                <h3
                  className="text-red-600 font-bold text-sm sm:text-base md:text-lg"
                  style={orbitronStyle}
                >
                  {o.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">{o.email}</p>
                <p className="text-gray-600 text-xs sm:text-sm">{o.phone}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
