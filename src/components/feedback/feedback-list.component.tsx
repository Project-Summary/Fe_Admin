"use client";
// pages/admin/feedback/FeedbackListPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import { QueryFeedbackParams } from '@/interface/feedback.interface';
import {
    Table,
    Button,
    Space,
    Tag,
    Rate,
    Popconfirm,
    Modal,
    Input,
    Select,
    DatePicker,
    Card,
    Checkbox,
    Avatar,
    Tooltip,
    Dropdown,
    MenuProps
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    MoreOutlined,
    FlagOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Feedback } from '@/interface/feedback.interface';
import dayjs from 'dayjs';
import { selectFeedbacks, selectFeedbackPagination, selectFeedbackLoading, selectFeedbackDeleting, selectFeedbackModerating } from '@/app/redux/feedback/selector.feedback';
import { getAllFeedbacksThunk, deleteFeedbackThunk, deleteBulkFeedbacksThunk, moderateFeedbackThunk } from '@/app/redux/feedback/thunk.feedback';
import { AppDispatch } from '@/app/redux/store';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FeedbackListPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const feedbacks = useSelector(selectFeedbacks);
    const pagination = useSelector(selectFeedbackPagination);
    const loading = useSelector(selectFeedbackLoading);
    const deleting = useSelector(selectFeedbackDeleting);
    const moderating = useSelector(selectFeedbackModerating);
    const router = useRouter();
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState<QueryFeedbackParams>({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    useEffect(() => {
        dispatch(getAllFeedbacksThunk({ params: filters }));
    }, [dispatch, filters]);

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
    };

    const handleFilterChange = (key: keyof QueryFeedbackParams, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        setFilters(prev => ({ ...prev, page, limit: pageSize || prev.limit }));
    };

    const handleDelete = (id: string) => {
        dispatch(deleteFeedbackThunk({
            id,
            onSuccess: () => {
                dispatch(getAllFeedbacksThunk({ params: filters }));
            }
        }));
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) return;

        Modal.confirm({
            title: 'Xóa phản hồi đã chọn',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} phản hồi đã chọn không?`,
            onOk: () => {
                dispatch(deleteBulkFeedbacksThunk({
                    feedbackIds: selectedRowKeys,
                    onSuccess: () => {
                        setSelectedRowKeys([]);
                        dispatch(getAllFeedbacksThunk({ params: filters }));
                    }
                }));
            },
        });
    };

    const handleModerate = (id: string, action: 'approve' | 'reject' | 'flag') => {
        dispatch(moderateFeedbackThunk({
            id,
            action,
            onSuccess: () => {
                dispatch(getAllFeedbacksThunk({ params: filters }));
            }
        }));
    };

    const getStatusTag = (feedback: Feedback) => {
        if (feedback.isFlagged) {
            return <Tag color="red">Đã gắn cờ</Tag>;
        }
        if (feedback.moderationAction === 'approve') {
            return <Tag color="green">Đã duyệt</Tag>;
        }
        if (feedback.moderationAction === 'reject') {
            return <Tag color="red">Bị từ chối</Tag>;
        }
        if (!feedback.isVisible) {
            return <Tag color="orange">Đã ẩn</Tag>;
        }
        return <Tag color="blue">Đang chờ duyệt</Tag>;
    };

    const getActionMenu = (record: Feedback): MenuProps => ({
        items: [
            {
                key: 'approve',
                label: 'Duyệt',
                icon: <CheckOutlined />,
                onClick: () => handleModerate(record._id, 'approve'),
            },
            {
                key: 'reject',
                label: 'Từ chối',
                icon: <CloseOutlined />,
                onClick: () => handleModerate(record._id, 'reject'),
            },
            {
                key: 'flag',
                label: 'Gắn cờ',
                icon: <FlagOutlined />,
                onClick: () => handleModerate(record._id, 'flag'),
            },
            {
                type: 'divider',
            },
            {
                key: 'delete',
                label: 'Xóa',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record._id),
            },
        ],
    });

    const columns: ColumnsType<Feedback> = [
        {
            title: 'Người dùng',
            dataIndex: 'userId',
            key: 'user',
            width: 200,
            render: (user) => (
                <Space>
                    <Avatar src={user.avatar} size="small">
                        {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Nội dung',
            key: 'content',
            width: 200,
            render: (_, record) => {
                const content = record.movieId || record.storyId;
                const type = record.movieId ? 'Phim' : 'Truyện';
                return content ? (
                    <div>
                        <div className="font-medium">{content.title}</div>
                        <Tag>{type}</Tag>
                    </div>
                ) : (
                    <span className="text-gray-400">Không có nội dung</span>
                );
            },
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rate',
            key: 'rate',
            width: 120,
            render: (rate) => <Rate disabled defaultValue={rate} />,
            sorter: true,
        },
        {
            title: 'Phản hồi',
            dataIndex: 'content',
            key: 'feedback',
            ellipsis: {
                showTitle: false,
            },
            render: (content) => (
                <Tooltip placement="topLeft" title={content}>
                    <div className="max-w-xs truncate">{content}</div>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => getStatusTag(record),
            filters: [
                { text: 'Đang chờ duyệt', value: 'pending' },
                { text: 'Đã duyệt', value: 'approved' },
                { text: 'Bị từ chối', value: 'rejected' },
                { text: 'Đã gắn cờ', value: 'flagged' },
            ],
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
            sorter: true,
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => { router.push(`/feedback/${record._id}`) }}
                    />
                    <Dropdown
                        menu={getActionMenu(record)}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            loading={moderating}
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];


    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys as string[]);
        },
    };

    return (
        <div className="p-6">
            <Card>
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Quản lý phản hồi</h1>
                        <Space>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setFilterVisible(!filterVisible)}
                            >
                                Bộ lọc
                            </Button>
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleBulkDelete}
                                    loading={deleting}
                                >
                                    Xoá đã chọn ({selectedRowKeys.length})
                                </Button>
                            )}
                        </Space>
                    </div>
                    <div className="flex gap-4 mb-4">
                        <Search
                            placeholder="Tìm kiếm phản hồi..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                    </div>

                    {filterVisible && (
                        <Card size="small" className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* <Select
                placeholder="Loại nội dung"
                allowClear
                onChange={(value) => {
                    if (value === 'movie') {
                        handleFilterChange('storyId', undefined);
                    } else if (value === 'story') {
                        handleFilterChange('movieId', undefined);
                    }
                }}
            >
                <Option value="movie">Phim</Option>
                <Option value="story">Truyện</Option>
            </Select> */}

                                <Select
                                    placeholder="Đánh giá"
                                    allowClear
                                    onChange={(value) => {
                                        handleFilterChange('minRate', value);
                                        handleFilterChange('maxRate', value);
                                    }}
                                >
                                    <Option value={5}>5 Sao</Option>
                                    <Option value={4}>4 Sao</Option>
                                    <Option value={3}>3 Sao</Option>
                                    <Option value={2}>2 Sao</Option>
                                    <Option value={1}>1 Sao</Option>
                                </Select>

                                <Select
                                    placeholder="Sắp xếp theo"
                                    value={filters.sortBy}
                                    onChange={(value) => handleFilterChange('sortBy', value)}
                                >
                                    <Option value="createdAt">Ngày tạo</Option>
                                    <Option value="rate">Đánh giá</Option>
                                    <Option value="helpfulCount">Lượt đánh giá hữu ích</Option>
                                </Select>

                                <Select
                                    placeholder="Thứ tự sắp xếp"
                                    value={filters.sortOrder}
                                    onChange={(value) => handleFilterChange('sortOrder', value)}
                                >
                                    <Option value="desc">Giảm dần</Option>
                                    <Option value="asc">Tăng dần</Option>
                                </Select>
                            </div>
                        </Card>
                    )}
                </div>

                <Table
                    columns={columns}
                    dataSource={feedbacks}
                    rowKey="_id"
                    loading={loading}
                    rowSelection={rowSelection}
                    pagination={{
                        current: pagination?.currentPage,
                        total: pagination?.totalItems,
                        pageSize: pagination?.itemsPerPage,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} trong tổng số ${total} phản hồi`,
                        onChange: handlePageChange,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default FeedbackListPage;
