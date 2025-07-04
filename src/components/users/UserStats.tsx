// File: components/users/UserStats.tsx
"use client";

import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  CalendarClock,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/interface/user.interface";

interface UserStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsers: number;
    roleDistribution: {
      [UserRole.ADMIN]: number;
      [UserRole.MODERATOR]: number;
      [UserRole.USER]: number;
    };
    lastRegisteredDate?: Date;
  };
}

export default function UserStats({ stats }: UserStatsProps) {
  const activePercentage = stats.totalUsers > 0
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;

  const inactivePercentage = stats.totalUsers > 0
    ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.newUsers} người dùng mới trong 30 ngày qua
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng đang hoạt động</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${activePercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{activePercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng không hoạt động</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inactiveUsers}</div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${inactivePercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{inactivePercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Trong 30 ngày qua
          </p>
        </CardContent>
      </Card>

      {/* Phân phối vai trò */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Phân phối vai trò người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Quản trị viên</p>
                  <p className="text-sm font-medium">
                    {stats.roleDistribution[UserRole.ADMIN]} người dùng
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${stats.totalUsers ?
                        (stats.roleDistribution[UserRole.ADMIN] / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Người kiểm duyệt</p>
                  <p className="text-sm font-medium">
                    {stats.roleDistribution[UserRole.MODERATOR]} người dùng
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${stats.totalUsers ?
                        (stats.roleDistribution[UserRole.MODERATOR] / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Người dùng thường xuyên</p>
                  <p className="text-sm font-medium">
                    {stats.roleDistribution[UserRole.USER]} người dùng
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${stats.totalUsers ?
                        (stats.roleDistribution[UserRole.USER] / stats.totalUsers) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity Overview */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng quan về hoạt động của người dùng</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <Activity className="h-5 w-5 text-blue-500 mb-1" />
              <div className="text-2xl font-bold">
                {(stats.activeUsers / (stats.totalUsers || 1) * 100).toFixed(1)}%
              </div>
              <span className="text-xs text-muted-foreground">Tỷ lệ hoạt động</span>
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg">
              <CalendarClock className="h-5 w-5 text-green-500 mb-1" />
              <div className="text-lg font-medium">
                {stats.lastRegisteredDate
                  ? new Date(stats.lastRegisteredDate).toLocaleDateString()
                  : "N/A"}
              </div>
              <span className="text-xs text-muted-foreground">Đăng ký lần cuối</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}