// File: app/(dashboard)/movies/episodes/[id]/preview/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    SkipBack,
    SkipForward,
    Loader2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/app/redux/store';
import { getEpisodeDetailThunk } from '@/app/redux/film/thunk.film';
import { IEpisode, ContentStatus } from '@/app/redux/film/interface.film';

export default function EpisodePreviewPage() {
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const episodeId = params.id as string;

    // Redux state
    const { loading, error } = useSelector((state: RootState) => state.film);

    // Local state
    const [episode, setEpisode] = useState<IEpisode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    // Fetch episode details on mount
    useEffect(() => {
        if (episodeId) {
            fetchEpisodeDetails();
        }
    }, [episodeId]);

    const fetchEpisodeDetails = async () => {
        try {
            const episodeResult = await dispatch(getEpisodeDetailThunk({ epId: episodeId })).unwrap();
            setEpisode(episodeResult.data.data);
        } catch (error) {
            console.error('Error fetching episode details:', error);
            toast.error('Không thể tải thông tin chi tiết về tập phim');
        }
    };

    // Handle play/pause
    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    // Handle mute/unmute
    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm">Đang tải tập phim...</p>
                </div>
            </div>
        );
    }

    if (error || !episode) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-white text-center">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                    <h3 className="text-lg font-medium">Không tìm thấy tập phim</h3>
                    <p className="text-muted-foreground">
                        {error || 'The episode you are looking for does not exist.'}
                    </p>
                    <Button onClick={() => router.push(`/movies/episodes/${episodeId}`)} className="mt-4 z-40">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Video Player Container */}
            <div className="relative w-full h-screen">
                {/* Video/Thumbnail Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {episode.videoUrl ? (
                        <video
                            className="w-full h-full object-contain"
                            poster={episode.thumbnail}
                            controls={false}
                            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                            onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                        >
                            <source src={episode.videoUrl} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    ) : episode.thumbnail ? (
                        <img
                            src={episode.thumbnail}
                            alt={episode.title}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-400">
                            <Play className="h-24 w-24" />
                            <p className="text-xl">Không có video nào có sẵn</p>
                        </div>
                    )}
                </div>

                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/movies/episodes/${episodeId}`)}
                            className="text-white hover:bg-white/20 z-40"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay trở lại
                        </Button>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Tập phim {episode.episodeNumber}
                            </Badge>
                            <Badge variant={
                                episode.status === ContentStatus.PUBLISHED ? "default" :
                                    episode.status === ContentStatus.PENDING_REVIEW ? "outline" : "secondary"
                            }>
                                {episode.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Episode Info Overlay */}
                <div className="absolute top-20 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-md">
                        <h1 className="text-2xl font-bold mb-2">{episode.title}</h1>
                        {episode.description && (
                            <p className="text-sm text-gray-300 line-clamp-3">{episode.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                            <span>{episode.duration} phút</span>
                            <span>•</span>
                            <span>{episode.statistics.views.toLocaleString()} lượt xem</span>
                        </div>
                    </div>
                </div>

                {/* Video Controls */}
                {showControls && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-2 text-sm">
                                <span>{formatTime(currentTime)}</span>
                                <div className="flex-1 bg-white/20 rounded-full h-1">
                                    <div
                                        className="bg-white rounded-full h-1 transition-all duration-200"
                                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                    />
                                </div>
                                <span>{formatTime(duration || episode.duration * 60)}</span>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                                        className="text-white hover:bg-white/20"
                                    >
                                        <SkipBack className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        onClick={togglePlayPause}
                                        className="text-white hover:bg-white/20"
                                    >
                                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                                        className="text-white hover:bg-white/20"
                                    >
                                        <SkipForward className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={toggleMute}
                                        className="text-white hover:bg-white/20"
                                    >
                                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:bg-white/20"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (document.fullscreenElement) {
                                                document.exitFullscreen();
                                            } else {
                                                document.documentElement.requestFullscreen();
                                            }
                                        }}
                                        className="text-white hover:bg-white/20"
                                    >
                                        <Maximize className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subtitles Display */}
                {episode.subtitles && episode.subtitles.length > 0 && (
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black/80 text-white px-4 py-2 rounded text-center max-w-2xl">
                            <p className="text-lg">Có sẵn phụ đề trong {episode.subtitles.length} ngôn ngữ</p>
                        </div>
                    </div>
                )}

                {/* Click to toggle controls */}
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setShowControls(!showControls)}
                />
            </div>

            {/* Episode Details Panel (Hidden by default, can be toggled) */}
            <div className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-sm border-l border-white/10 overflow-y-auto">
                <div className="p-6 space-y-6">
                    <h2 className="text-xl font-bold">Chi tiết tập phim</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">Thống kê</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-white/10 p-2 rounded">
                                    <div className="font-medium">{episode.statistics.views.toLocaleString()}</div>
                                    <div className="text-gray-400">Lượt xem</div>
                                </div>
                                <div className="bg-white/10 p-2 rounded">
                                    <div className="font-medium">{episode.statistics.likes.toLocaleString()}</div>
                                    <div className="text-gray-400">Thích</div>
                                </div>
                                <div className="bg-white/10 p-2 rounded">
                                    <div className="font-medium">{episode.statistics.comments.toLocaleString()}</div>
                                    <div className="text-gray-400">Bình luận</div>
                                </div>
                                <div className="bg-white/10 p-2 rounded">
                                    <div className="font-medium">{episode.statistics.shares.toLocaleString()}</div>
                                    <div className="text-gray-400">Cổ phiếu</div>
                                </div>
                            </div>
                        </div>

                        {episode.transcript && (
                            <div>
                                <h3 className="font-medium mb-2">Bản ghi chép</h3>
                                <div className="bg-white/10 p-3 rounded max-h-40 overflow-y-auto">
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                                        {episode.transcript.substring(0, 500)}
                                        {episode.transcript.length > 500 && '...'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="font-medium mb-2">Thông tin kỹ thuật</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Khoảng thời gian:</span>
                                    <span>{episode.duration} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tập phim:</span>
                                    <span>#{episode.episodeNumber}</span>
                                </div>
                                {episode.seasonNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Mùa:</span>
                                        <span>{episode.seasonNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Trạng thái:</span>
                                    <Badge variant="outline" className="text-xs text-white">
                                        {episode.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
