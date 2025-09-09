import { api } from '../shared/http';

export const sessionManager = {
  // Создать новую сессию
  async createNewSession() {
    try {
      const response = await api.post('/chat/new-session');
      return response.data;
    } catch (error) {
      console.error('Ошибка создания новой сессии:', error);
      throw error;
    }
  },
  
  // Начать новый диалог
  async startNewDialog(title = 'Новый диалог') {
    try {
      // Сначала создаем новую сессию
      await this.createNewSession();
      
      // Затем создаем conversation
      const response = await api.post('/chat/start', { title });
      return response.data;
    } catch (error) {
      console.error('Ошибка создания нового диалога:', error);
      throw error;
    }
  },
  
  // Очистить все данные
  clearAll() {
    localStorage.clear();
    document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  },

  // Проверить статус сессии
  async checkSessionStatus() {
    try {
      const response = await api.get('/chat/list');
      return { hasSession: true, data: response.data };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { hasSession: false, error: 'Unauthorized' };
      }
      throw error;
    }
  }
};
