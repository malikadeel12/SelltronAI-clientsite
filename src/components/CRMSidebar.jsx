import React, { useState } from 'react';

const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};
const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

const CRMSidebar = ({ customerData, isLoading, isVisible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      
      <div className={`fixed right-0 top-0 h-full bg-[#000000] shadow-2xl border-l border-[#333333] transform transition-all duration-300 ease-in-out z-40 ${isVisible ? 'translate-x-0' : 'translate-x-full'} ${isCollapsed ? 'w-12' : 'w-80'}`}>
        {/* Header */}
        <div className="bg-[#000000] text-[#f5f5f5] px-6 py-4 border-b border-[#333333]">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <>
                <h2 className="text-lg font-semibold text-[#f5f5f5]" style={orbitronStyle}>CRM Dashboard</h2>
                <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[#f5f5f5] hover:bg-[#333333] rounded-full p-2 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="h-[calc(100vh-80px)] overflow-y-auto bg-[#000000] scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#333333] hover:scrollbar-thumb-[#FFD700]/80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
              <span className="mt-4 text-[#f5f5f5]" style={openSansStyle}>Loading customer data...</span>
            </div>
          ) : customerData ? (
          <div className="p-6 space-y-6 pb-8">
            {/* Customer Profile Card */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-4 border border-[#333333]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-[#000000] font-semibold text-lg" style={orbitronStyle}>
                  {customerData.name ? customerData.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-[#f5f5f5]" style={orbitronStyle}>
                    {customerData.name || 'Unknown Customer'}
                  </h3>
                  <p className="text-sm text-[#cccccc]" style={openSansStyle}>
                    {customerData.company || 'No Company'}
                  </p>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-2">
                {customerData.email && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#f5f5f5]" style={openSansStyle}>{customerData.email}</span>
                  </div>
                )}
                {customerData.phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-[#f5f5f5]" style={openSansStyle}>{customerData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
              <h4 className="font-medium text-[#f5f5f5] mb-3 flex items-center" style={orbitronStyle}>
                <svg className="w-5 h-5 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h4>
              <div className="space-y-3">
                {customerData.name && (
                  <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                    <span className="text-sm text-[#cccccc]" style={openSansStyle}>Name:</span>
                    <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.name}</span>
                  </div>
                )}
                {customerData.email && (
                  <div className="py-2 border-b border-[#333333]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#cccccc] flex-shrink-0" style={openSansStyle}>Email:</span>
                      <span className="text-sm font-medium text-[#f5f5f5] break-all text-right" style={openSansStyle}>{customerData.email}</span>
                    </div>
                  </div>
                )}
                {customerData.phone && (
                  <div className="py-2 border-b border-[#333333]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#cccccc] flex-shrink-0" style={openSansStyle}>Phone:</span>
                      <span className="text-sm font-medium text-[#f5f5f5] break-all text-right" style={openSansStyle}>{customerData.phone}</span>
                    </div>
                  </div>
                )}
                {customerData.company && (
                  <div className="py-2 border-b border-[#333333]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#cccccc] flex-shrink-0" style={openSansStyle}>Company:</span>
                      <span className="text-sm font-medium text-[#f5f5f5] break-all text-right" style={openSansStyle}>{customerData.company}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Key Highlights Section */}
            {(customerData.budget || customerData.timeline || customerData.decision_makers || 
              customerData.pain_points || customerData.objectives || customerData.urgency || 
              customerData.competitors || customerData.use_case) && (
              <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-4 border border-[#333333]">
                <h4 className="font-medium text-[#f5f5f5] mb-3 flex items-center" style={orbitronStyle}>
                  <svg className="w-5 h-5 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Key Highlights
                </h4>
                <div className="space-y-3">
                  {customerData.budget && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Budget:
                      </span>
                      <span className="text-sm font-medium text-[#FFD700]" style={openSansStyle}>{customerData.budget}</span>
                    </div>
                  )}
                  {customerData.timeline && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timeline:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.timeline}</span>
                    </div>
                  )}
                  {customerData.decision_makers && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Decision Makers:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.decision_makers}</span>
                    </div>
                  )}
                  {customerData.pain_points && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Pain Points:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.pain_points}</span>
                    </div>
                  )}
                  {customerData.objectives && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Objectives:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.objectives}</span>
                    </div>
                  )}
                  {customerData.urgency && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Urgency:
                      </span>
                      <span className={`text-sm font-medium ${customerData.urgency === 'urgent' ? 'text-red-400' : customerData.urgency === 'moderate' ? 'text-yellow-400' : 'text-green-400'}`} style={openSansStyle}>
                        {customerData.urgency}
                      </span>
                    </div>
                  )}
                  {customerData.competitors && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Competitors:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.competitors}</span>
                    </div>
                  )}
                  {customerData.use_case && (
                    <div className="flex justify-between items-center py-2 border-b border-[#333333]">
                      <span className="text-sm text-[#cccccc] flex items-center" style={openSansStyle}>
                        <svg className="w-4 h-4 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Use Case:
                      </span>
                      <span className="text-sm font-medium text-[#f5f5f5]" style={openSansStyle}>{customerData.use_case}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HubSpot Data Indicator */}
            {customerData.hubspotData && (
              <div className="bg-[#1a1a1a] border border-[#FFD700] rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                  <span className="text-sm text-[#FFD700] font-medium" style={openSansStyle}>Data synced with HubSpot</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-[#FFD700] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-[#f5f5f5] mb-2" style={orbitronStyle}>No Customer Data</h3>
            <p className="text-[#cccccc] text-sm" style={openSansStyle}>Customer information will appear here when detected in the conversation.</p>
          </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default CRMSidebar;
