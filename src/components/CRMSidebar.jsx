import React, { useState } from 'react';

const CRMSidebar = ({ customerData, isLoading, isVisible }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-200 transform transition-all duration-300 ease-in-out z-40 ${isVisible ? 'translate-x-0' : 'translate-x-full'} ${isCollapsed ? 'w-12' : 'w-80'}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 border-b border-blue-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <>
              <h2 className="text-lg font-semibold">CRM Dashboard</h2>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-blue-700 rounded p-1 transition-colors"
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
        <div className="h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="mt-4 text-gray-600">Loading customer data...</span>
            </div>
          ) : customerData ? (
          <div className="p-6 space-y-6">
            {/* Customer Profile Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {customerData.name ? customerData.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {customerData.name || 'Unknown Customer'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {customerData.company || 'No Company'}
                  </p>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-2">
                {customerData.email && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{customerData.email}</span>
                  </div>
                )}
                {customerData.phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-700">{customerData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Details
              </h4>
              <div className="space-y-3">
                {customerData.name && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">{customerData.name}</span>
                  </div>
                )}
                {customerData.email && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">{customerData.email}</span>
                  </div>
                )}
                {customerData.phone && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{customerData.phone}</span>
                  </div>
                )}
                {customerData.company && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Company:</span>
                    <span className="text-sm font-medium text-gray-900">{customerData.company}</span>
                  </div>
                )}
              </div>
            </div>


            {/* HubSpot Data Indicator */}
            {customerData.hubspotData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-800 font-medium">Data synced with HubSpot</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Data</h3>
            <p className="text-gray-500 text-sm">Customer information will appear here when detected in the conversation.</p>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMSidebar;
