import API from "../api";
import {
  CreateFeedbackData,
  UpdateFeedbackData,
  QueryFeedbackParams,
} from "@/interface/feedback.interface";

export default class FeedbackAPI {
  static createFeedback(data: CreateFeedbackData) {
    return API.post("/feedback", data);
  }

  static getAllFeedback(params?: QueryFeedbackParams) {
    return API.get("/feedback", { params });
  }

  static getFeedbackStats() {
    return API.get("/feedback/stats");
  }

  static getFeedbackByContent(contentId: string, contentType: "movie" | "story", page = 1, limit = 10) {
    return API.get(`/feedback/content/${contentId}/${contentType}`, {
      params: { page, limit },
    });
  }

  static getMyFeedbacks(page = 1, limit = 10) {
    return API.get("/feedback/my-feedbacks", {
      params: { page, limit },
    });
  }

  static getFeedbackById(id: string) {
    return API.get(`/feedback/${id}`);
  }

  static updateFeedback(id: string, data: UpdateFeedbackData) {
    return API.patch(`/feedback/${id}`, data);
  }

  static deleteFeedback(id: string) {
    return API.delete(`/feedback/${id}`);
  }

  static deleteBulkFeedbacks(feedbackIds: string[]) {
    return API.patch("/feedback/bulk/delete", { feedbackIds });
  }

  static moderateFeedback(id: string, action: "approve" | "reject" | "flag") {
    return API.patch(`/feedback/${id}/moderate`, { action });
  }
}
