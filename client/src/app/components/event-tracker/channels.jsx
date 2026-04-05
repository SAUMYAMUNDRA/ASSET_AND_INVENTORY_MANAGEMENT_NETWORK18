import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ChannelEventsDashboard = () => {
  const [channelsData, setChannelsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

        // fetch already aggregated stats
        const res = await fetch(`${baseUrl}/api/eventreport/getchannelstats`);
        const grouped = await res.json();

        setChannelsData(grouped);

        // expand all categories initially
        const initialExpanded = {};
        Object.keys(grouped).forEach(category => {
          initialExpanded[category] = true;
        });
        setExpandedCategories(initialExpanded);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCategory = category => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const formatCategoryName = type => {
    const names = {
      network: "Network Channels",
      national: "National Channels",
      business: "Business Channels",
      digital: "Digital Channels",
      HSM: "HSM Channels",
      regional: "Regional Channels"
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1) + " Channels";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Channel Events Dashboard
        </h1>

        {Object.entries(channelsData).map(([categoryType, categoryData]) => (
          <div key={categoryType} className="mb-8">
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
              onClick={() => toggleCategory(categoryType)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formatCategoryName(categoryType)} ({categoryData.channels.length})
                  </h2>
                  <div className="text-sm text-gray-500">
                    Total Events: {categoryData.totalEvents}
                  </div>
                </div>
                {expandedCategories[categoryType] ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedCategories[categoryType] && (
              <div className="mt-4 space-y-4">
                {categoryData.channels.map(channel => (
                  <div
                    key={channel.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Channel Info */}
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600 mb-4">
                          {channel.channel_name}
                        </h3>
                        <div className="text-sm text-gray-500 mb-2">
                          {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
                        </div>
                      </div>

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Events</span>
                            <span className="font-medium">{channel.totalEvents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Live</span>
                            <span className="font-medium text-red-600">
                              {channel.liveEvents}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recorded</span>
                            <span className="font-medium">{channel.recordedEvents}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Producers</span>
                            <span className="font-medium">{channel.producers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Locations</span>
                            <span className="font-medium">{channel.locations}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelEventsDashboard;
