// File: components/users/UserActivityChart.jsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export default function UserActivityChart({ data, timeRanges = ["7d", "30d", "90d", "1y"] }: { data: any, timeRanges: any }) {
    const [timeRange, setTimeRange] = useState("30d");
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Filter data based on selected time range
        const filteredData = data.filter((item: any) => {
            const itemDate = new Date(item.date);
            const now = new Date();
            const daysAgo = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

            switch (timeRange) {
                case "7d":
                    return daysAgo <= 7;
                case "30d":
                    return daysAgo <= 30;
                case "90d":
                    return daysAgo <= 90;
                case "1y":
                    return daysAgo <= 365;
                default:
                    return true;
            }
        });

        setChartData(filteredData);
    }, [data, timeRange]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hoạt động người dùng</CardTitle>
                    <CardDescription>Người dùng đang hoạt động và lượt đăng ký mới theo thời gian</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeRanges.map((range: any) => (
                            <SelectItem key={range} value={range}>
                                {range === "7d"
                                    ? "7 Ngày"
                                    : range === "30d"
                                        ? "30 Ngày"
                                        : range === "90d"
                                            ? "90 Ngày"
                                            : "1 Năm"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="activeUsers"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                                name="Người dùng hoạt động"
                            />
                            <Line
                                type="monotone"
                                dataKey="newUsers"
                                stroke="#82ca9d"
                                name="Lượt đăng ký mới"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
