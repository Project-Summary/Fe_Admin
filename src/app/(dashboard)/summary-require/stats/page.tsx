// app/admin/require-summaries/statistics/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { selectAdminRequireSummaryStatistics, selectAdminRequireSummaryLoading, selectAdminRequireSummaryError } from '@/app/redux/require-summary/selectors.requireSummary';
import { clearAdminError } from '@/app/redux/require-summary/slice.adminRequireSummary';
import { getAllRequireSummariesStatsThunk } from '@/app/redux/require-summary/thunk.require-summary';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


const RequireSummaryStatsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const statistics = useSelector(selectAdminRequireSummaryStatistics);
  const loading = useSelector(selectAdminRequireSummaryLoading);
  const error = useSelector(selectAdminRequireSummaryError);

  useEffect(() => {
    dispatch(getAllRequireSummariesStatsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminError());
    }
  }, [error, dispatch]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Không có số liệu thống kê nào có sẵn
        </div>
      </div>
    );
  }

  const statusData = [
    { label: 'Chờ duyệt', value: statistics.statusStats.pending, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { label: 'Đã duyệt', value: statistics.statusStats.approved, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Bị từ chối', value: statistics.statusStats.rejected, color: 'bg-red-500', textColor: 'text-red-600' },
    { label: 'Hoàn thành', value: statistics.statusStats.completed, color: 'bg-green-500', textColor: 'text-green-600' }
  ];
  const contentTypeData = [
    { label: 'Phim', value: statistics.contentTypeStats.movie, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { label: 'Truyện', value: statistics.contentTypeStats.story, color: 'bg-indigo-500', textColor: 'text-indigo-600' }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'bg-blue-500' }: {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${color} rounded-md p-3 text-white`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {/* <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p> */}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total, color, textColor }: {
    label: string;
    value: number;
    total: number;
    color: string;
    textColor: string;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${textColor}`}>{label}</span>
          <span className="text-sm text-gray-500">
            {value} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  console.log("statistics : ", statistics);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu Thống kê Tóm tắt</h1>
        <button
          onClick={() => router.push('/summary-require')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại Quản lý
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng số yêu cầu"
          value={statistics.total}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="bg-blue-500"
        />

        <StatCard
          title="Yêu cầu đang chờ xử lý"
          value={statistics.statusStats.pending}
          subtitle="Đang chờ xem xét"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-yellow-500"
        />

        <StatCard
          title="Hoàn thành"
          value={statistics.statusStats.completed}
          subtitle="Sẵn sàng để tạo nội dung"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-green-500"
        />

        <StatCard
          title="Yêu cầu gần đây"
          value={statistics.recentRequests}
          subtitle="7 ngày qua"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Phân phối trạng thái</h2>
          <div className="space-y-4">
            {statusData.map((item) => (
              <ProgressBar
                key={item.label}
                label={item.label}
                value={item.value}
                total={statistics.total}
                color={item.color}
                textColor={item.textColor}
              />
            ))}
          </div>

          {/* Status Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {statistics.total > 0 ? ((statistics.statusStats.completed / statistics.total) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics.total > 0 ? ((statistics.statusStats.pending / statistics.total) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-500">Tỷ lệ đang chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phân phối loại nội dung */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Phân phối loại nội dung</h2>
          <div className="space-y-4">
            {contentTypeData.map((item) => (
              <ProgressBar
                key={item.label}
                label={item.label}
                value={item.value}
                total={statistics.total}
                color={item.color}
                textColor={item.textColor}
              />
            ))}
          </div>

          {/* Content Type Details */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Yêu cầu phim</span>
                <span className="text-sm text-gray-900">{statistics.contentTypeStats.movie}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Yêu cầu truyện</span>
                <span className="text-sm text-gray-900">{statistics.contentTypeStats.story}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Tổng</span>
                <span className="text-sm font-semibold text-gray-900">{statistics.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Đang chờ duyệt</p>
                <p className="text-sm text-gray-500">Yêu cầu {statistics.statusStats.pending}</p>
              </div>
            </div>
          </button>

          <button
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Quy trình đã được phê duyệt</p>
                <p className="text-sm text-gray-500">Yêu cầu {statistics.statusStats.approved}</p>
              </div>
            </div>
          </button>

          <button
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Tạo nội dung</p>
                <p className="text-sm text-gray-500">{statistics.statusStats.completed} đã sẵn sàng</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số hiệu suất</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.total > 0 ? ((statistics.statusStats.approved + statistics.statusStats.completed) / statistics.total * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Tỷ lệ chấp thuận</div>
            <div className="text-xs text-gray-400 mt-1">
              ({statistics.statusStats.approved + statistics.statusStats.completed} trong số {statistics.total})
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {statistics.total > 0 ? (statistics.statusStats.rejected / statistics.total * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Tỷ lệ từ chối</div>
            <div className="text-xs text-gray-400 mt-1">
              ({statistics.statusStats.rejected} trong số {statistics.total})
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statistics.statusStats.approved > 0 ? (statistics.statusStats.completed / statistics.statusStats.approved * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Tỷ lệ hoàn thành</div>
            <div className="text-xs text-gray-400 mt-1">
              ({statistics.statusStats.completed} trong số {statistics.statusStats.approved})
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {statistics.contentTypeStats.movie > statistics.contentTypeStats.story ? 'Phim' : 'Câu chuyện'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Yêu cầu nhiều nhất</div>
            <div className="text-xs text-gray-400 mt-1">
              {Math.max(statistics.contentTypeStats.movie, statistics.contentTypeStats.story)} yêu cầu
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity Indicator */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
            <p className="text-sm text-gray-600 mt-1">
              {statistics.recentRequests} yêu cầu mới trong 7 ngày qua
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.recentRequests}
            </div>
            <div className="text-sm text-gray-500">Tuần này</div>
          </div>
        </div>

        {statistics.recentRequests > 0 && (
          <div className="mt-4 p-3 bg-white rounded-md">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Hoạt động là {statistics.recentRequests > 10 ? 'cao' : statistics.recentRequests > 5 ? 'trung bình' : 'thấp'} tuần này
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequireSummaryStatsPage;
