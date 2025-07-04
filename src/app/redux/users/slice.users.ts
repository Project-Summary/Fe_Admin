import { createSlice } from '@reduxjs/toolkit';
import {
  getAllUsersThunk,
  getCurrentUserThunk,
  findOneUserThunk,
  createUserThunk,
  updateCurrentUserThunk,
  updateUserThunk,
  deleteUserThunk,
  getUserStatisticsThunk,
  getWatchListThunk,
  addToWatchListThunk,
  removeFromWatchListThunk,
  getViewHistoryThunk,
} from './thunk.users';

interface UsersState {
  users: any[];
  currentUser: any | null;
  selectedUser: any | null;
  statistics: any | null;
  watchList: any[];
  viewHistory: any[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  statistics: null,
  watchList: [],
  viewHistory: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data.data.data;
        console.log("Payload get all users thunk : ", action.payload.data.data.data);
      })
      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get current user
      .addCase(getCurrentUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.data.data.data;

        console.log("Payload get current user thunk : ", action.payload.data.data.data);
      })
      .addCase(getCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Find one user
      .addCase(findOneUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(findOneUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Payload find one user thunk : ", action.payload.data.data);
        state.selectedUser = action.payload.data.data;
      })
      .addCase(findOneUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create user
      .addCase(createUserThunk.fulfilled, (state, action) => {
        console.log("Create current user thunk : ", action.payload.data.data);
        state.users.push(action.payload.data.data);
      })

      // Update current user
      .addCase(updateCurrentUserThunk.fulfilled, (state, action) => {
        state.currentUser = { ...state.currentUser, ...action.payload.data.data };
      })

      // Regular user update
      .addCase(updateUserThunk.fulfilled, (state, action) => {

        console.log("Update user thunk : ", action.payload.data.data);

        const index = state.users.findIndex((u) => u._id === action.payload.data.data._id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...action.payload.data.data };
        }
        // Update selected user if it's the same
        if (state.selectedUser && state.selectedUser._id === action.payload.data.data._id) {
          state.selectedUser = { ...state.selectedUser, ...action.payload.data.data };
        }
      })

      // // Admin update user
      // .addCase(adminUpdateUserThunk.fulfilled, (state, action) => {
      //   const index = state.users.findIndex((u) => u._id === action.payload._id);
      //   if (index !== -1) {
      //     state.users[index] = { ...state.users[index], ...action.payload };
      //   }
      //   // Update selected user if it's the same
      //   if (state.selectedUser && state.selectedUser._id === action.payload._id) {
      //     state.selectedUser = { ...state.selectedUser, ...action.payload };
      //   }
      // })

      // // Bulk update users
      // .addCase(bulkUpdateUsersThunk.fulfilled, (state, action) => {
      //   // Handle bulk update result
      //   const { successfulIds, updates } = action.payload;
      //   if (successfulIds && updates) {
      //     successfulIds.forEach((userId: string) => {
      //       const userIndex = state.users.findIndex(u => u._id === userId);
      //       if (userIndex !== -1) {
      //         state.users[userIndex] = { ...state.users[userIndex], ...updates };
      //       }
      //     });
      //   }
      // })

      // // Bulk change roles
      // .addCase(bulkChangeRolesThunk.fulfilled, (state, action) => {
      //   // Handle bulk role change result
      //   const { successfulIds } = action.payload;
      //   const newRole = action.meta.arg.role; // Get role from original argument
      //   if (successfulIds) {
      //     successfulIds.forEach((userId: string) => {
      //       const userIndex = state.users.findIndex(u => u._id === userId);
      //       if (userIndex !== -1) {
      //         state.users[userIndex].role = newRole;
      //       }
      //     });
      //   }
      // })

      // // Bulk change status
      // .addCase(bulkChangeStatusThunk.fulfilled, (state, action) => {
      //   // Handle bulk status change result
      //   const { successfulIds } = action.payload;
      //   const newStatus = action.meta.arg.isActive; // Get status from original argument
      //   if (successfulIds) {
      //     successfulIds.forEach((userId: string) => {
      //       const userIndex = state.users.findIndex(u => u._id === userId);
      //       if (userIndex !== -1) {
      //         state.users[userIndex].isActive = newStatus;
      //       }
      //     });
      //   }
      // })

      // Delete user
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        console.log("Delete user thunk : ", action.payload.data.data);

        state.users = state.users.filter((u) => u._id !== action.payload.data.data.id);
        // Clear selected user if it was deleted
        if (state.selectedUser && state.selectedUser._id === action.payload.data.data.id) {
          state.selectedUser = null;
        }
      })

      // Bulk delete users
      // .addCase(bulkDeleteUsersThunk.fulfilled, (state, action) => {
      //   state.users = state.users.filter((u) => !action.payload.userIds.includes(u._id));
      //   // Clear selected user if it was deleted
      //   if (state.selectedUser && action.payload.userIds.includes(state.selectedUser._id)) {
      //     state.selectedUser = null;
      //   }
      // })

      // Get statistics
      .addCase(getUserStatisticsThunk.fulfilled, (state, action) => {
        state.statistics = action.payload.data.data;
        console.log("Get users statistics thunk", action.payload.data.data);
      })

      // Watchlist
      .addCase(getWatchListThunk.fulfilled, (state, action) => {
        state.watchList = action.payload;
        console.log("Get watch list thunk: ", action.payload.data.data.data);
      })
      .addCase(addToWatchListThunk.fulfilled, (state, action) => {
        state.watchList.push(action.payload);
        console.log("Add watch list thunk: ", action.payload.data.data.data);
      })
      .addCase(removeFromWatchListThunk.fulfilled, (state, action) => {
        console.log("Remove from watch list thunk", action.payload.data.data.data);

        state.watchList = state.watchList.filter(
          (item) => item.id !== action.payload.id
        );
      })

      // View history
      .addCase(getViewHistoryThunk.fulfilled, (state, action) => {
        console.log("Get view history thunk: ", action.payload.data.data.data);

        state.viewHistory = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser, setSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;