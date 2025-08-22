import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import aboutImg from "../../assets/images/aboutImage.png";
// Font styles
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};

const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

export default function AboutPage() {
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
        <section className="text-center py-10 px-4 md:px-6 max-w-4xl mx-auto">
          <h1
            className="text-2xl md:text-5xl font-bold mb-4"
            style={orbitronStyle}
          >
            About Us – Sell Predator
          </h1>
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            At Sell Predator, we believe sales should not be complicated – they
            should be effective. Every day, companies lose valuable time, money,
            and opportunities because sales teams do not have the right
            information at the right moment. This is exactly the problem we set
            out to solve. We are a team of experts in sales, technology, and
            artificial intelligence. Together, we built a platform that redefines
            the traditional sales process. Sell Predator combines the knowledge of
            top-performing salespeople with the intelligence of modern AI to
            deliver measurable results.
            <br />
            <br />
            What makes Sell Predator unique? Sell Predator listens to every
            customer conversation in real time, analyzes the dialogue, and
            provides instant suggestions for the best possible response or
            strategy. At the same time, the system saves every question, every
            answer, and every interaction, becoming smarter with each use. Over
            time, this builds a powerful knowledge base that every team member can
            access.
          </p>
        </section>

        {/* Image + Goals Section */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left Image */}
          <div className="flex justify-center">
            <img
              src={aboutImg}
              alt="About Sell Predator"
              className="w-full h-auto max-w-md md:max-w-full rounded-lg"
            />
          </div>

          {/* Right Goals */}
          <div className="flex flex-col space-y-6">
            {/* Goal */}
            <div className="border border-red-300 rounded-lg p-4 md:p-6 bg-white shadow-sm">
              <h3
                className="text-lg md:text-xl font-bold mb-2"
                style={orbitronStyle}
              >
                Our Goal
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Our goal is simple: to turn beginners into professionals instantly.
                While traditional systems only provide raw data, Sell Predator
                gives clear and actionable recommendations. This leads to higher
                efficiency, more closed deals, and noticeable revenue growth.
              </p>
            </div>

            {/* Mission */}
            <div className="border border-red-300 rounded-lg p-4 md:p-6 bg-white shadow-sm">
              <h3
                className="text-lg md:text-xl font-bold mb-2"
                style={orbitronStyle}
              >
                Our Mission
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                We aim to make the sales process smarter, easier, and more
                successful. Every sales professional – no matter their experience
                level – should have the tools to achieve their best performance.
              </p>
            </div>

            {/* Vision */}
            <div className="border border-red-300 rounded-lg p-4 md:p-6 bg-white shadow-sm">
              <h3
                className="text-lg md:text-xl font-bold mb-2"
                style={orbitronStyle}
              >
                Our Vision
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                The future of sales will no longer rely on luck or guesswork. It
                will be powered by intelligent technology that actively supports
                sales teams. Sell Predator is continuously evolving, adding new
                features, and transforming the way companies sell worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Quality Section */}
        <section className="bg-white shadow-md max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 mt-10 mb-12 rounded-lg">
          <div className="space-y-6">
            {/* Heading */}
            <h3
              className="text-2xl md:text-3xl font-bold text-gray-800"
              style={orbitronStyle}
            >
              Quality over Quantity
            </h3>

            {/* Line + Text */}
            <div className="flex flex-col md:flex-row items-start">
              {/* Vertical Line */}
              <div className="w-full md:w-1 h-1 md:h-auto bg-red-600 mb-4 md:mb-0 md:mr-6 rounded"></div>

              {/* Paragraph */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                To guarantee excellent support and a flawless user experience,{" "}
                <span className="font-semibold text-gray-800">Sell Predator</span>{" "}
                deliberately accepts only a limited number of clients at a time.
                By focusing on quality instead of mass adoption, we ensure that
                every customer receives the highest level of service and
                performance. Sell Predator is more than just a tool – it is your
                partner for sustainable and long-term sales success.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
