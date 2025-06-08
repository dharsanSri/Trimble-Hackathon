import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, Wind, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchDistrictFloodRisks } from '@/services/weatherService';
import { tamilNaduFloodData, getRiskLevelCounts } from '@/lib/geoData';

interface DistrictRisk {
  district: string;
  floodRisk: {
    riskLevel: 'high' | 'medium' | 'low';
    rainfallPrediction: number;
    maxWindSpeed: number;
    hasAlerts: boolean;
    floodAlerts: boolean;
  };
  error?: string;
}

// Get initial risk counts from GeoJSON data
const initialRiskCounts = getRiskLevelCounts(tamilNaduFloodData);

interface StatsData {
  highRiskAreas: number;
  avgRainfall: number;
  maxWindSpeed: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
}

const FloodPredictionStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [statsData, setStatsData] = useState<StatsData>({
    highRiskAreas: 0,
    avgRainfall: 0,
    maxWindSpeed: 0,
    riskTrend: 'stable'
  });

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real-time data from weather API
      const risks = await fetchDistrictFloodRisks();
      const filteredRisks = risks.filter(risk => !risk.error);
      setLastUpdated(new Date());
      
      // Calculate statistics from district risks
      const highRiskCount = filteredRisks.filter(risk => risk.floodRisk.riskLevel === 'high').length;
      
      const rainfallValues = filteredRisks.map(risk => risk.floodRisk.rainfallPrediction);
      const avgRainfall = rainfallValues.length > 0 
        ? rainfallValues.reduce((sum, val) => sum + val, 0) / rainfallValues.length
        : 0;
      
      const maxWindSpeed = Math.max(
        ...filteredRisks.map(risk => risk.floodRisk.maxWindSpeed),
        0
      );
      
      // Determine risk trend (in a real app, this would compare to historical data)
      const riskTrend = highRiskCount > 3 ? 'increasing' : 
                        highRiskCount > 1 ? 'stable' : 'decreasing';
      
      setStatsData({
        highRiskAreas: highRiskCount,
        avgRainfall,
        maxWindSpeed,
        riskTrend
      });
    } catch (err: any) {
      console.error('Error fetching risk data:', err);
      setError(err.message || 'Failed to fetch flood risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const renderTrendIcon = () => {
    switch(statsData.riskTrend) {
      case 'increasing': return <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />;
      case 'decreasing': return <ArrowDownRight className="h-3.5 w-3.5 text-green-500" />;
      default: return <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />;
    }
  };

  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-5 w-5 border-3 border-orange-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-2 bg-red-50 rounded-lg border border-red-200 text-red-600 text-xs">
          {error}
          <button 
            onClick={fetchRiskData} 
            className="ml-2 px-1.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-red-50 p-1.5 rounded-lg flex flex-col items-center">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                <p className="text-xs text-gray-500">Risk</p>
              </div>
              <p className="text-base font-bold text-red-600">{statsData.highRiskAreas}</p>
            </div>
            
            <div className="bg-blue-50 p-1.5 rounded-lg flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-600" />
                <p className="text-xs text-gray-500">Rain</p>
              </div>
              <p className="text-base font-bold text-blue-600">{statsData.avgRainfall.toFixed(0)}<span className="text-xs">mm</span></p>
            </div>
            
            <div className="bg-purple-50 p-1.5 rounded-lg flex flex-col items-center">
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-purple-600" />
                <p className="text-xs text-gray-500">Wind</p>
              </div>
              <p className="text-base font-bold text-purple-600">{statsData.maxWindSpeed.toFixed(0)}<span className="text-xs">km</span></p>
            </div>
            
            <div className="bg-gray-50 p-1.5 rounded-lg flex flex-col items-center">
              <div className="flex items-center gap-1">
                {renderTrendIcon()}
                <p className="text-xs text-gray-500">Trend</p>
              </div>
              <p className={`text-base font-bold ${
                statsData.riskTrend === 'increasing' ? 'text-red-600' : 
                statsData.riskTrend === 'decreasing' ? 'text-green-600' : 
                'text-yellow-600'
              }`}>
                {statsData.riskTrend === 'increasing' ? '↑' : statsData.riskTrend === 'decreasing' ? '↓' : '→'}
              </p>
            </div>
          </div>
          
          <div className="mt-2 pt-1 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <button 
                onClick={fetchRiskData}
                disabled={loading}
                className="text-blue-600 hover:underline text-xs flex items-center gap-0.5"
              >
                Refresh
              </button>
              <span>
                Updated: {lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-700 mb-1">District Risk Analysis</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${Math.min(statsData.highRiskAreas * 10, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{statsData.highRiskAreas}/10</span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Rainfall Intensity</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(statsData.avgRainfall / 2, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{Math.round(statsData.avgRainfall)}mm</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloodPredictionStats; 