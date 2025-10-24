import React, { useState, useEffect } from 'react';
import { saveKeyHighlightsToHubSpot } from '../lib/api.js';

const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontWeight: 600,
};
const openSansStyle = {
  fontFamily: "'Open Sans', sans-serif",
};

const CRMSidebar = ({ customerData, isLoading, isVisible, keyHighlights = {} }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [highlightsSaved, setHighlightsSaved] = useState(false);

  // Auto-save key highlights to HubSpot when they are displayed
  useEffect(() => {
    const saveHighlightsToHubSpot = async () => {
      // Only save if:
      // 1. We have customer data with email
      // 2. We have key highlights to save
      // 3. We haven't already saved these highlights
      // 4. We're not currently loading
      if (
        customerData?.email && 
        Object.keys(keyHighlights).length > 0 && 
        !highlightsSaved && 
        !isLoading
      ) {
        try {
          console.log('💾 CRM Sidebar: Auto-saving key highlights to HubSpot:', {
            email: customerData.email,
            keyHighlights
          });
          
          await saveKeyHighlightsToHubSpot(customerData.email, keyHighlights);
          setHighlightsSaved(true);
          console.log('✅ CRM Sidebar: Key highlights saved successfully to HubSpot');
        } catch (error) {
          console.error('❌ CRM Sidebar: Failed to save key highlights to HubSpot:', error);
          // Don't set highlightsSaved to true on error, so we can retry
        }
      }
    };

    saveHighlightsToHubSpot();
  }, [customerData?.email, keyHighlights, highlightsSaved, isLoading]);

  // Reset highlights saved flag when customer changes
  useEffect(() => {
    setHighlightsSaved(false);
  }, [customerData?.email]);
  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      
      <div className={`fixed right-0 top-0 h-full bg-[#f5f5f5] shadow-2xl border-l border-[#FFD700] transform transition-all duration-300 ease-in-out z-40 ${isVisible ? 'translate-x-0' : 'translate-x-full'} ${isCollapsed ? 'w-12' : 'w-80'}`}>
        {/* Header */}
        <div className="bg-[#FFD700] text-[#000000] px-6 py-4 border-b border-[#FFD700]">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <>
                <h2 className="text-lg font-semibold text-[#000000]" style={orbitronStyle}>CRM Dashboard</h2>
                <div className="w-2 h-2 bg-[#000000] rounded-full animate-pulse"></div>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[#000000] hover:bg-[#f5f5f5] rounded-full p-2 transition-colors"
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
        <div className="h-[calc(100vh-80px)] overflow-y-auto bg-[#f5f5f5] scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#000000] hover:scrollbar-thumb-[#FFD700]/80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
              <span className="mt-4 text-[#000000]" style={openSansStyle}>Loading customer data...</span>
            </div>
          ) : customerData ? (
          <div className="p-6 space-y-6 pb-8">
            {/* Customer Profile Card */}
            <div className="bg-gradient-to-r from-[#ffffff] to-[#f0f0f0] rounded-lg p-4 border border-[#FFD700]">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center text-[#000000] font-semibold text-lg" style={orbitronStyle}>
                  {customerData.name ? customerData.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-[#000000]" style={orbitronStyle}>
                    {customerData.name || 'Unknown Customer'}
                  </h3>
                  <p className="text-sm text-[#666666]" style={openSansStyle}>
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
                    <span className="text-sm text-[#000000]" style={openSansStyle}>{customerData.email}</span>
                  </div>
                )}
                {customerData.phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-[#000000]" style={openSansStyle}>{customerData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-[#ffffff] border border-[#FFD700] rounded-lg p-4">
              <h4 className="font-medium text-[#000000] mb-3 flex items-center" style={orbitronStyle}>
                <svg className="w-5 h-5 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h4>
              <div className="space-y-3">
                {customerData.name && (
                  <div className="flex justify-between items-center py-2 border-b border-[#FFD700]">
                    <span className="text-sm text-[#666666]" style={openSansStyle}>Name:</span>
                    <span className="text-sm font-medium text-[#000000]" style={openSansStyle}>{customerData.name}</span>
                  </div>
                )}
                {customerData.email && (
                  <div className="py-2 border-b border-[#FFD700]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#666666] flex-shrink-0" style={openSansStyle}>Email:</span>
                      <span className="text-sm font-medium text-[#000000] break-all text-right" style={openSansStyle}>{customerData.email}</span>
                    </div>
                  </div>
                )}
                {customerData.phone && (
                  <div className="py-2 border-b border-[#FFD700]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#666666] flex-shrink-0" style={openSansStyle}>Phone:</span>
                      <span className="text-sm font-medium text-[#000000] break-all text-right" style={openSansStyle}>{customerData.phone}</span>
                    </div>
                  </div>
                )}
                {customerData.company && (
                  <div className="py-2 border-b border-[#FFD700]">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#666666] flex-shrink-0" style={openSansStyle}>Company:</span>
                      <span className="text-sm font-medium text-[#000000] break-all text-right" style={openSansStyle}>{customerData.company}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Key Highlights Section */}
            {Object.keys(keyHighlights).length > 0 && (
              <div className="bg-[#ffffff] border border-[#FFD700] rounded-lg p-4">
                <h4 className="font-medium text-[#000000] mb-3 flex items-center" style={orbitronStyle}>
                  <svg className="w-5 h-5 text-[#FFD700] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Key Highlights
                </h4>
                <div className="space-y-3">
                  {keyHighlights.budget && (
                    <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-lg p-3 border-l-4 border-[#FFD700]">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-[#000000]" style={openSansStyle}>Budget:</span>
                          <p className="text-sm text-[#666666] mt-1" style={openSansStyle}>{keyHighlights.budget}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {keyHighlights.timeline && (
                    <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-lg p-3 border-l-4 border-[#FFD700]">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-[#000000]" style={openSansStyle}>Timeline:</span>
                          <p className="text-sm text-[#666666] mt-1" style={openSansStyle}>{keyHighlights.timeline}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {keyHighlights.objections && (
                    <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-lg p-3 border-l-4 border-[#FFD700]">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-[#000000]" style={openSansStyle}>Objections:</span>
                          <p className="text-sm text-[#666666] mt-1" style={openSansStyle}>{keyHighlights.objections}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {keyHighlights.importantInfo && (
                    <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-lg p-3 border-l-4 border-[#FFD700]">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <span className="text-sm font-medium text-[#000000]" style={openSansStyle}>Important Info:</span>
                          <p className="text-sm text-[#666666] mt-1" style={openSansStyle}>{keyHighlights.importantInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HubSpot Data Indicator - Always show since all data comes from HubSpot */}
            <div className="bg-[#ffffff] border border-[#FFD700] rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#FFD700] rounded-full"></div>
                <span className="text-sm text-[#FFD700] font-medium" style={openSansStyle}>Data synced with HubSpot</span>
              </div>
            </div>

            {/* Key Highlights Save Status */}
            {Object.keys(keyHighlights).length > 0 && (
              <div className="bg-[#ffffff] border border-[#FFD700] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {highlightsSaved ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium" style={openSansStyle}>Key highlights saved to HubSpot</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-600 font-medium" style={openSansStyle}>Saving key highlights to HubSpot...</span>
                      </>
                    )}
                  </div>
                  {!highlightsSaved && customerData?.email && (
                    <button
                      onClick={async () => {
                        try {
                          await saveKeyHighlightsToHubSpot(customerData.email, keyHighlights);
                          setHighlightsSaved(true);
                          console.log('✅ Manual save successful');
                        } catch (error) {
                          console.error('❌ Manual save failed:', error);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-[#FFD700] text-[#000000] rounded hover:bg-[#FFD700]/80 transition-colors"
                      style={openSansStyle}
                    >
                      Save Now
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-[#FFD700] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-[#000000] mb-2" style={orbitronStyle}>No Customer Data</h3>
            <p className="text-[#666666] text-sm" style={openSansStyle}>Customer information will appear here when detected in the conversation.</p>
          </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default CRMSidebar;
