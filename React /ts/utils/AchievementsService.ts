import { Achievement, User } from 'shared/types';

import http from './index';

class AchievementsService {
  static async fetchAchievements(search = ''): Promise<Achievement[]> {
    return http.get('/achievements', { params: { search } });
  }

  static async fetchAchievement(id: number): Promise<Achievement> {
    return http.get(`/achievements/${id}`);
  }

  static async createAchievement(achievement: object): Promise<Achievement> {
    return http.post('/achievements', achievement);
  }

  static async updateAchievement(id: number, achievement: object): Promise<Achievement> {
    return http.put(`/achievements/${id}`, achievement);
  }

  static async uploadImage(id: number, file: FormData): Promise<void> {
    return http.post(`/achievements/${id}/upload-image`, file);
  }

  static async updateAchievementUsers(id: number, users: { users: User[] }): Promise<Achievement> {
    return http.put(`/achievements/${id}/users`, users);
  }

  static async deleteAchievement(id: number): Promise<Achievement> {
    return http.delete(`/achievements/${id}`);
  }
}

export default AchievementsService;
