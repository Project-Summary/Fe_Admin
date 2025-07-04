"use client";
// pages/admin/feedback/FeedbackDashboard.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Rate,
  Avatar,
  Spin,
} from 'antd';
import {
  StarOutlined,
  MessageOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { selectOverallStats, selectFeedbackStatsLoading } from '@/app/redux/feedback/selector.feedback';
import { getFeedbackStatsThunk } from '@/app/redux/feedback/thunk.feedback';
import { AppDispatch } from '@/app/redux/store';

const FeedbackDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const overallStats = useSelector(selectOverallStats);
  const loading = useSelector(selectFeedbackStatsLoading);

  useEffect(() => {
    dispatch(getFeedbackStatsThunk());
  }, [dispatch]);

  const getRatingDistributionData = () => {
    if (!overallStats?.ratingDistribution) return [];

    return [
      { rating: '5 Sao', count: overallStats.ratingDistribution[5] || 0 },
      { rating: '4 Sao', count: overallStats.ratingDistribution[4] || 0 },
      { rating: '3 Sao', count: overallStats.ratingDistribution[3] || 0 },
      { rating: '2 Sao', count: overallStats.ratingDistribution[2] || 0 },
      { rating: '1 Sao', count: overallStats.ratingDistribution[1] || 0 },
    ];
  };

  const columnConfig = {
    data: getRatingDistributionData(),
    xField: 'xếp hạng',
    yField: 'đếm',
    color: '#1890ff',
    columnWidthRatio: 0.6,
    meta: {
      count: {
        alias: 'Số lượng đánh giá',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!overallStats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Phân tích phản hồi</h1>
        <div className="flex justify-center items-center h-64">
          <span>Không có dữ liệu có sẵn</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Phân tích phản hồi</h1>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số phản hồi"
              value={overallStats.totalFeedbacks || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={overallStats.averageRating || 0}
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phản hồi gần đây"
              value={overallStats.recentFeedbacks || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="this week"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nội dung được đánh giá cao nhất"
              value={overallStats.topRatedContent?.length || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Rating Distribution Chart */}
        <Col xs={24} lg={12}>
          <Card title="Phân phối xếp hạng" className="h-96">
            <Column {...columnConfig} height={300} />
          </Card>
        </Col>

        {/* Rating Breakdown */}
        <Col xs={24} lg={12}>
          <Card title="Phân tích xếp hạng" className="h-96">
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = overallStats.ratingDistribution?.[star as keyof typeof overallStats.ratingDistribution] || 0;
                const total = overallStats.totalFeedbacks || 1;
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span>{star}</span>
                      <StarOutlined className="text-yellow-400" />
                    </div>
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      strokeColor="#fadb14"
                      className="flex-1"
                    />
                    <div className="w-16 text-right text-sm">
                      {count} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Top Rated Content */}
        <Col xs={24}>
          <Card title="Nội dung được đánh giá cao nhất">
            {overallStats.topRatedContent && overallStats.topRatedContent.length > 0 ? (
              <List
                dataSource={overallStats.topRatedContent}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar size={48} shape="square">
                          {item.title?.charAt(0) || 'N'}
                        </Avatar>
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.title || 'Tiêu đề không xác định'}</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {item.contentType || 'Không xác định'}
                          </span>
                        </div>
                      }
                      description={
                        <div className="flex items-center gap-4">
                          <Rate disabled value={item.averageRating || 0} />
                          <span className="text-sm text-gray-600">
                            {(item.averageRating || 0).toFixed(1)} ({item.totalFeedbacks || 0} đánh giá)
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có nội dung được đánh giá cao nhất
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FeedbackDashboard;
