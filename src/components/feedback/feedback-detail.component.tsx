"use client";
// pages/feedback/FeedbackDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    Card,
    Descriptions,
    Rate,
    Tag,
    Button,
    Space,
    Divider,
    Modal,
    Form,
    Input,
    Select,
    Spin,
    Result,
    Col,
    Row,
    Avatar as AvatarAnt,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    FlagOutlined,
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { selectCurrentFeedback, selectFeedbackLoading, selectFeedbackModerating, selectFeedbackDeleting } from '@/app/redux/feedback/selector.feedback';
import { getFeedbackByIdThunk, moderateFeedbackThunk, deleteFeedbackThunk } from '@/app/redux/feedback/thunk.feedback';
import { AppDispatch } from '@/app/redux/store';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const { TextArea } = Input;
const { Option } = Select;

const FeedbackDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const currentFeedback = useSelector(selectCurrentFeedback);
    const loading = useSelector(selectFeedbackLoading);
    const moderating = useSelector(selectFeedbackModerating);
    const deleting = useSelector(selectFeedbackDeleting);

    const [moderateModalVisible, setModerateModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            dispatch(getFeedbackByIdThunk(id));
        }
    }, [dispatch, id]);

    const handleModerate = (values: any) => {
        if (!currentFeedback) return;

        dispatch(moderateFeedbackThunk({
            id: currentFeedback._id,
            action: values.action,
            onSuccess: () => {
                setModerateModalVisible(false);
                form.resetFields();
                if (id) {
                    dispatch(getFeedbackByIdThunk(id));
                }
            }
        }));
    };

    const handleDelete = () => {
        if (!currentFeedback) return;

        Modal.confirm({
            title: 'Delete Feedback',
            content: 'Are you sure you want to delete this feedback? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => {
                dispatch(deleteFeedbackThunk({
                    id: currentFeedback._id,
                    onSuccess: () => {
                        navigate.push('/admin/feedback');
                    }
                }));
            },
        });
    };

    const getStatusTag = () => {
        if (!currentFeedback) return null;

        if (currentFeedback.isFlagged) {
            return <Tag color="red">Đã đánh dấu</Tag>;
        }
        if (currentFeedback.moderationAction === 'approve') {
            return <Tag color="green">Tán thành</Tag>;
        }
        if (currentFeedback.moderationAction === 'reject') {
            return <Tag color="red">Từ chối</Tag>;
        }
        if (!currentFeedback.isVisible) {
            return <Tag color="orange">Đang ẩn</Tag>;
        }
        return <Tag color="blue">Đang chờ xử lý</Tag>;
    };

    const getContentInfo = () => {
        if (!currentFeedback) return null;

        const content = currentFeedback.movieId || currentFeedback.storyId;
        const type = currentFeedback.movieId ? 'Movie' : 'Story';
        return { content, type };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!currentFeedback) {
        return (
            <Result
                status="404"
                title="Feedback Not Found"
                subTitle="The feedback you're looking for doesn't exist or has been deleted."
                extra={
                    <Button type="primary" onClick={() => navigate.push('/admin/feedback')}>
                        Quay lại danh sách phản hồi
                    </Button>
                }
            />
        );
    }

    const getNameInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const contentInfo = getContentInfo();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate.back()}
                    className="mb-4"
                >
                    Quay lại danh sách phản hồi
                </Button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Chi tiết phản hồi</h1>
                        <div className="flex items-center gap-2">
                            {getStatusTag()}
                            <span className="text-gray-500">
                                ID: {currentFeedback._id}
                            </span>
                        </div>
                    </div>

                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => setModerateModalVisible(true)}
                            loading={moderating}
                        >
                            Duyệt nội dung
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                            loading={deleting}
                        >
                            Xóa
                        </Button>
                    </Space>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Feedback Content">
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Rate disabled value={currentFeedback.rate} />
                                <span className="text-lg font-semibold">
                                    {currentFeedback.rate}/5 Sao
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {currentFeedback.content}
                                </p>
                            </div>
                        </div>

                        <Divider />

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <CalendarOutlined />
                                <span>Đã tạo: {dayjs(currentFeedback.createdAt).format('MMM DD, YYYY HH:mm')}</span>
                            </div>
                            {currentFeedback.updatedAt !== currentFeedback.createdAt && (
                                <div className="flex items-center gap-2">
                                    <EditOutlined />
                                    <span>Đã cập nhật: {dayjs(currentFeedback.updatedAt).format('MMM DD, YYYY HH:mm')}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="User Information" className="mb-4">
                        <div className="flex flex-col items-center justify-center text-center mb-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={currentFeedback.userId.name} />
                                <AvatarFallback className="text-lg">
                                    {getNameInitials(currentFeedback.userId.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="mt-2">
                                <div className="font-semibold">{currentFeedback.userId.name}</div>
                                <div className="text-gray-500 text-sm">{currentFeedback.userId.email}</div>
                            </div>
                        </div>
                    </Card>

                    {contentInfo?.content && (
                        <Card title="Thông tin nội dung" className="mb-4">
                            <div className="text-center">
                                <AvatarAnt
                                    src={contentInfo.content.poster}
                                    size={64}
                                    shape="square"
                                >
                                    {contentInfo.content.title?.charAt(0)}
                                </AvatarAnt>
                                <div className="mt-2">
                                    <div className="font-semibold">{contentInfo.content.title}</div>
                                    <Tag color="blue">{contentInfo.type}</Tag>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card title="Thống kê phản hồi">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Lượt bình chọn hữu ích">
                                {currentFeedback.helpfulCount}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khả năng hiển thị">
                                {currentFeedback.isVisible ? 'Có thể hiển thị' : 'Ẩn'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Đã gắn cờ">
                                {currentFeedback.isFlagged ? 'Có' : 'Không'}
                            </Descriptions.Item>
                            {currentFeedback.moderatedBy && (
                                <>
                                    <Descriptions.Item label="Người kiểm duyệt">
                                        {currentFeedback.moderatedBy}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Người kiểm duyệt tại">
                                        {dayjs(currentFeedback.moderatedAt).format('MMM DD, YYYY HH:mm')}
                                    </Descriptions.Item>
                                    {currentFeedback.moderationNote && (
                                        <Descriptions.Item label="Ghi chú kiểm duyệt">
                                            {currentFeedback.moderationNote}
                                        </Descriptions.Item>
                                    )}
                                </>
                            )}
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* Moderation Modal */}
            <Modal
                title="Duyệt phản hồi"
                open={moderateModalVisible}
                onCancel={() => {
                    setModerateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModerate}
                >
                    <Form.Item
                        label="Hành động"
                        name="action"
                        rules={[{ required: true, message: 'Vui lòng chọn một hành động' }]}
                    >
                        <Select placeholder="Chọn hành động duyệt">
                            <Option value="approve">
                                <Space>
                                    <CheckOutlined className="text-green-500" />
                                    Phê duyệt
                                </Space>
                            </Option>
                            <Option value="reject">
                                <Space>
                                    <CloseOutlined className="text-red-500" />
                                    Từ chối
                                </Space>
                            </Option>
                            <Option value="flag">
                                <Space>
                                    <FlagOutlined className="text-orange-500" />
                                    Gắn cờ
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ghi chú (Không bắt buộc)"
                        name="note"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Thêm ghi chú về hành động duyệt này..."
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button
                                onClick={() => {
                                    setModerateModalVisible(false);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={moderating}
                            >
                                Áp dụng hành động
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default FeedbackDetailPage;
