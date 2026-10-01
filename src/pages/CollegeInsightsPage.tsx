import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Compass,
  FileCheck,
  CheckCircle2,
  Building2,
  Calendar,
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Check,
} from 'lucide-react';
import { College, TimeRangeFilter, CollegeInsightsData } from '../types';
import { ownerService } from '../services/ownerService';
import { exportCollegeInsightsToExcel } from '../utils/excelExport';
import { MetricCard } from '../components/insights/MetricCard';
import { UserGrowthChart } from '../components/insights/UserGrowthChart';
import { LostVsFoundChart } from '../components/insights/LostVsFoundChart';
import { ReturnsChart } from '../components/insights/ReturnsChart';
import { ActiveUsersChart } from '../components/insights/ActiveUsersChart';
import { CollegeComparisonTable } from '../components/insights/CollegeComparisonTable';
import { SkeletonStatCard } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const CollegeInsightsPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [insightsData, setInsightsData] = useState<CollegeInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Fetch Colleges List for Dropdown
  const fetchColleges = useCallback(async () => {
    try {
      const res = await ownerService.getAllColleges();
      if (!res.error && res.data) {
        setColleges(res.data);
      }
    } catch (e) {
      console.warn('Colleges load note:', e);
    }
  }, []);

  // 2. Fetch Insights Data based on Selected College & Time Range
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ownerService.getCollegeInsights(
        selectedCollegeId === 'all' ? undefined : selectedCollegeId,
        timeRange
      );

      if (res.error) {
        setError(res.error);
        setInsightsData(null);
      } else {
        setInsightsData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve college insights.');
      setInsightsData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCollegeId, timeRange]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const selectedCollegeName =
    selectedCollegeId === 'all'
      ? 'All Colleges (Platform Aggregate)'
      : colleges.find((c) => c.id === selectedCollegeId)?.name || 'Selected Campus';

  const timeRangeLabel =
    timeRange === '7d'
      ? 'Past 7 Days'
      : timeRange === '30d'
      ? 'Past 30 Days'
      : timeRange === '90d'
      ? 'Past 90 Days'
      : 'All Time';

  const handleExportExcel = async () => {
    if (!insightsData || isExporting) return;
    setIsExporting(true);
    setExportNotice(null);

    try {
      const result = await exportCollegeInsightsToExcel({
        data: insightsData,
        collegeName: selectedCollegeName,
        isAllColleges: selectedCollegeId === 'all',
        timeRange,
      });

      if (result.success) {
        setExportNotice({
          type: 'success',
          message: `Excel report generated successfully (${result.filename})`,
        });
        setTimeout(() => setExportNotice(null), 5000);
      } else {
        setExportNotice({
          type: 'error',
          message: result.error || 'Failed to export Excel workbook.',
        });
      }
    } catch (err: any) {
      setExportNotice({
        type: 'error',
        message: err.message || 'An error occurred while preparing the export.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 flex items-center gap-2">
            <span>College Insights & Analytics</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-600 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">
              Read-Only
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Aggregated operational metrics, user activity, and lost & found performance across campuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Excel Export Action */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting || loading || !insightsData}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 hover:border-neutral-900 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            title="Export factual metrics to Excel (.xlsx)"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-neutral-900" />
                <span>Export Excel</span>
              </>
            )}
          </button>

          {/* Refresh Action */}
          <button
            onClick={() => fetchInsights()}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Refresh analytics data"
            aria-label="Refresh insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Export Feedback Banner */}
      {exportNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all shadow-xs ${
            exportNotice.type === 'success'
              ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
              : 'bg-neutral-100 border-neutral-300 text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {exportNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-neutral-950 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neutral-950 shrink-0" />
            )}
            <span className="font-medium">{exportNotice.message}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-neutral-400 hover:text-neutral-800 font-mono text-xs cursor-pointer ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Controls: College Selector & Time Range */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* College Selector Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-0.5" htmlFor="college-select">
              Campus Scope
            </label>
            <select
              id="college-select"
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-medium outline-none transition-colors cursor-pointer"
            >
              <option value="all">All Colleges (Platform Aggregate)</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start md:self-center">
          <span className="text-[11px] font-medium text-neutral-500 mr-1 hidden sm:inline flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Period:</span>
          </span>
          {(['7d', '30d', '90d', 'all'] as TimeRangeFilter[]).map((range) => {
            const label =
              range === '7d'
                ? '7 Days'
                : range === '30d'
                ? '30 Days'
                : range === '90d'
                ? '90 Days'
                : 'All Time';

            const isSelected = timeRange === range;

            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Database Error Alert */}
      {error && (
        <div className="p-4 bg-white border border-neutral-300 rounded-xl flex items-start gap-3 text-xs text-neutral-800 shadow-xs">
          <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-neutral-950">Analytics Query Notice</p>
            <p className="mt-0.5 opacity-90 text-neutral-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-neutral-400 hover:text-neutral-900 font-mono text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="space-y-6">
          {/* Skeleton Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>

          {/* Skeleton Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-white border border-neutral-200 rounded-xl animate-pulse p-5" />
            <div className="h-64 bg-white border border-neutral-200 rounded-xl animate-pulse p-5" />
          </div>
        </div>
      ) : !insightsData ? (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={BarChart3}
            title="No Analytics Data Available"
            description="Connect to your Supabase instance to view live campus metrics and performance."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Metric Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Overview Metrics
              </h2>
              <span className="text-[11px] text-neutral-500 font-mono">
                {selectedCollegeName} · {timeRangeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <MetricCard
                label="Registered Users"
                value={insightsData.metrics.registeredUsers}
                icon={Users}
                subtext="Total members"
              />
              <MetricCard
                label="Active Users"
                value={insightsData.metrics.activeUsers}
                icon={UserCheck}
                subtext="Active accounts"
              />
              <MetricCard
                label="New Users"
                value={insightsData.metrics.newUsers}
                icon={UserPlus}
                subtext={timeRange === 'all' ? 'All time' : `In ${timeRangeLabel}`}
              />
              <MetricCard
                label="Lost Reports"
                value={insightsData.metrics.lostReports}
                icon={Search}
                subtext="Items reported lost"
              />
              <MetricCard
                label="Found Reports"
                value={insightsData.metrics.foundReports}
                icon={Compass}
                subtext="Items found & logged"
              />
              <MetricCard
                label="Claims Filed"
                value={insightsData.metrics.claimsCount}
                icon={FileCheck}
                subtext="Verification claims"
              />
              <MetricCard
                label="Successful Returns"
                value={insightsData.metrics.successfulReturns}
                icon={CheckCircle2}
                subtext="Resolved items"
                badge={
                  insightsData.metrics.lostReports > 0
                    ? `${Math.round(
                        (insightsData.metrics.successfulReturns /
                          Math.max(insightsData.metrics.lostReports, 1)) *
                          100
                      )}%`
                    : undefined
                }
              />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Line Chart */}
            <UserGrowthChart
              data={insightsData.timeline}
              collegeName={selectedCollegeName}
            />

            {/* Lost vs Found Comparative Bar Chart */}
            <LostVsFoundChart
              data={insightsData.timeline}
              totalLost={insightsData.metrics.lostReports}
              totalFound={insightsData.metrics.foundReports}
            />

            {/* Successful Returns Chart */}
            <ReturnsChart
              data={insightsData.timeline}
              totalReturns={insightsData.metrics.successfulReturns}
              totalClaims={insightsData.metrics.claimsCount}
            />

            {/* Active Users Distribution */}
            <ActiveUsersChart
              data={insightsData.activeUsersByCollege}
              isSpecificCollege={selectedCollegeId !== 'all'}
            />
          </div>

          {/* Factual College Comparison Table (Rendered only when 'All Colleges' is selected) */}
          {selectedCollegeId === 'all' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  College Distribution & Breakdown
                </h2>
                <span className="text-[11px] text-neutral-500">
                  {insightsData.comparison.length} Campus Locations
                </span>
              </div>
              <CollegeComparisonTable data={insightsData.comparison} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
