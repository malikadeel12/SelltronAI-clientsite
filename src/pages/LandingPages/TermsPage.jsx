import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"; 

// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function TermsPage() {
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

        {/* Heading */}
        <section className="text-center py-12 px-6">
          <h1
            className="text-3xl md:text-5xl font-bold text-gray-800"
            style={orbitronStyle}
          >
            Terms & Policies
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-3">
            Please read our terms and policies carefully before using Sell Predator
            services.
          </p>
        </section>

        {/* Subheading */}
        <h2
          className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 ml-6 md:ml-20"
          style={orbitronStyle}
        >
          General Terms of Service
        </h2>

        {/* Content Section */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-8 mt-6 mb-12">
          {/* Left Sidebar */}
          <aside className="space-y-4 font-medium">
            <p className="text-red-600 cursor-pointer">Legal</p>
            <p className="text-gray-800 hover:text-red-600 cursor-pointer">
              Service Level Agreement
            </p>
            <p className="text-gray-800 hover:text-red-600 cursor-pointer">
              Website Terms of Service
            </p>
            <p className="text-gray-800 hover:text-red-600 cursor-pointer">
              Cookies Policy
            </p>
            <p className="text-gray-800 hover:text-red-600 cursor-pointer">
              Privacy Policy
            </p>
          </aside>

          {/* Right Main Content */}
          <div className="md:col-span-3 bg-white rounded-lg p-6 md:p-8">
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              Sell Predator Terms of Services were last modified on July 30, 2025.
            </p>

            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              The following Terms of Services, together with any Additional Terms and
              Policies (collectively “ToS”, “Terms”, “Agreement”), form the entire legal
              agreement between you and Sell Predator in relation to your use of our
              website (https://www.sellpredator.com all its subdomains, additional
              top-level domains, and mobile apps) and any products, services, and
              information provided by Sell Predator (“we”,”us”,”our”).
            </p>

            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              Prior to purchasing a service from us, you need to ensure and declare that
              you have read, understood and agreed to our Terms of Service (Terms of Use)
              by checking the corresponding required checkbox.
            </p>

            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              Service purchases, client account creation, support service, affiliate
              service, chat services are not provided to prohibited clients. Such clients
              are defined as an entity related to some countries, regions, or individuals
              that are prohibited by certain governments and their trade, law or economic
              sanctions.
            </p>

            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              Unless otherwise provided with explicit written permission, Sell Predator
              also does not register and prohibits the use of any of our services in
              connection with, any Country-Code Top Level Domain Name (“ccTLD”) for any
              Sanctioned Country/Region.
            </p>

            {/* Definition Section */}
            <h3
              className="text-lg md:text-xl font-semibold mt-6 mb-3"
              style={orbitronStyle}
            >
              Definition of Terms you can expect in our Terms of Service
            </h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm md:text-base space-y-2">
              <li>
                “us”, “we”, “our”, “Sell Predator”, “Sell Predator” or “the Company” are
                used instead of Sell Predator – the owner of this Website and the offered
                in it services.
              </li>
              <li>
                “visitor” – is a person or a robot that is browsing our website while not
                being registered as an official “customer” of our services.
              </li>
              <li>
                “Member”, “Customer” – a person who has registered on our website,
                respectively is using or used our “service”.
              </li>
              <li>
                “User” – Collective term used to describe a visitor to our website or a
                member of our services.
              </li>
              <li>
                “Service” – functionality, web hosting product or an additional service
                that is serving the purpose of the Web Hosting and Domain Hosting
                technology.
              </li>
              <li>
                “Content” – The term can be used to describe a static resource such as,
                but not limited to, text, information, graphics, audio, video, AI,
                Software and any form of data.
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
