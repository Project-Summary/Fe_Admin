// File: hooks/useUserFilters.ts

import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { User } from '@/interface/user.interface';
import { AppDispatch, RootState } from '@/app/redux/store';
import { setSearch, UserFiltersState, setRole, setStatus, setDateRange, setLastActive, setSorting, setPage, setLimit, resetFilters } from '@/app/redux/userFilters/userFiltersSlice';


export const useUserFilters = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.userFilters);

  // Filter function
  const filterUsers = useMemo(() => {
    return (users: User[]): User[] => {
      if (!users) return [];

      return users.filter((user: User) => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (
            !user.name.toLowerCase().includes(searchLower) &&
            !user.email.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }

        // Role filter
        if (filters.role && filters.role !== "all" && user.role !== filters.role) {
          return false;
        }

        // Status filter
        if (filters.status && filters.status !== "all") {
          if (filters.status === 'active' && !user.isActive) return false;
          if (filters.status === 'inactive' && user.isActive) return false;
        }

        // Date range filter
        if (filters.dateFrom || filters.dateTo) {
          const userDate = new Date(user.createdAt);
          if (filters.dateFrom && userDate < filters.dateFrom) return false;
          if (filters.dateTo && userDate > filters.dateTo) return false;
        }

        // Last active filter
        if (filters.lastActive && filters.lastActive !== "all") {
          const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
          const now = new Date();
          
          switch (filters.lastActive) {
            case "today":
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (!lastLogin || lastLogin < yesterday) return false;
              break;
            case "thisWeek":
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              if (!lastLogin || lastLogin < weekAgo) return false;
              break;
            case "thisMonth":
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              if (!lastLogin || lastLogin < monthAgo) return false;
              break;
            case "never":
              if (lastLogin) return false;
              break;
          }
        }

        return true;
      });
    };
  }, [filters]);

  // Sort function
  const sortUsers = useMemo(() => {
    return (users: User[]): User[] => {
      if (!users.length) return users;

      return [...users].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'lastLoginAt':
            aValue = a.lastLoginAt ? new Date(a.lastLoginAt) : new Date(0);
            bValue = b.lastLoginAt ? new Date(b.lastLoginAt) : new Date(0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    };
  }, [filters.sortBy, filters.sortOrder]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.search !== "" ||
           filters.role !== "all" ||
           filters.status !== "all" ||
           filters.dateFrom !== undefined ||
           filters.dateTo !== undefined ||
           filters.lastActive !== "all";
  }, [filters]);

  // Actions
  const actions = {
    setSearch: (search: string) => dispatch(setSearch(search)),
    setRole: (role: UserFiltersState['role']) => dispatch(setRole(role)),
    setStatus: (status: UserFiltersState['status']) => dispatch(setStatus(status)),
    setDateRange: (range: { from?: Date; to?: Date }) => dispatch(setDateRange(range)),
    setLastActive: (lastActive: UserFiltersState['lastActive']) => dispatch(setLastActive(lastActive)),
    setSorting: (sorting: { sortBy: string; sortOrder: 'asc' | 'desc' }) => dispatch(setSorting(sorting)),
    setPage: (page: number) => dispatch(setPage(page)),
    setLimit: (limit: number) => dispatch(setLimit(limit)),
    resetFilters: () => dispatch(resetFilters()),
  };

  return {
    filters,
    filterUsers,
    sortUsers,
    hasActiveFilters,
    actions,
  };
};