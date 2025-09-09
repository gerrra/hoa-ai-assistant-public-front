import { api } from '../shared/http';
import { debug } from './debug';

export const chatManager = {
  // Получить сообщения с обработкой ошибок
  async getMessages(conversationId: string) {
    debug.log('🔍 Получаем сообщения для conversation:', conversationId);
    debug.log('🔍 URL запроса:', `/chat/${conversationId}/messages?limit=100`);
    
    try {
      const response = await api.get(`/chat/${conversationId}/messages`, { 
        params: { limit: 100 } 
      });
      
      debug.log('✅ Сообщения получены:', response.data);
      return { messages: response.data, conversationId };
    } catch (error: any) {
      debug.error('❌ Ошибка получения сообщений:', error);
      debug.error('❌ Статус ошибки:', error.response?.status);
      debug.error('❌ URL ошибки:', error.config?.url);
      
      if (error.response?.status === 404) {
        // Conversation не найдена, создаем новую
        debug.log('🔄 Conversation не найдена, создаем новую...');
        const newData = await this.createNewConversation();
        return { messages: [], conversationId: newData.conversation_id };
      }
      
      // При любой другой ошибке тоже создаем новую conversation
      debug.log('🔄 Создаем новую conversation из-за ошибки...');
      const newData = await this.createNewConversation();
      return { messages: [], conversationId: newData.conversation_id };
    }
  },
  
  // Создать новую conversation
  async createNewConversation(title = 'Новый диалог') {
    try {
      debug.log('🆕 Создаем новую conversation...');
      debug.log('🔄 Старый ID в localStorage:', localStorage.getItem('conversationId'));
      
      // Очищаем старый ID
      this.clearConversation();
      
      // Сначала создаем новую сессию
      await api.post('/chat/new-session');
      debug.log('✅ Новая сессия создана');
      
      // Затем создаем conversation
      const response = await api.post('/chat/start', { title });
      debug.log('✅ Новая conversation создана:', response.data);
      
      // Принудительно сохраняем новый conversation ID
      this.forceUpdateConversationId(response.data.conversation_id);
      
      return response.data;
    } catch (error) {
      debug.error('❌ Ошибка создания conversation:', error);
      throw error;
    }
  },
  
  // Отправить сообщение с проверкой conversation
  async sendMessage(conversationId: string, message: string, meta?: any, role: string = 'user') {
    try {
      debug.log('📤 Отправляем сообщение в conversation:', conversationId, 'с ролью:', role);
      
      // Сначала проверяем, существует ли conversation
      try {
        await api.get(`/chat/${conversationId}/messages`, { params: { limit: 1 } });
        debug.log('✅ Conversation существует');
      } catch (error: any) {
        if (error.response?.status === 404) {
          debug.log('🔄 Conversation не найдена, создаем новую...');
          const newData = await this.createNewConversation();
          conversationId = newData.conversation_id;
        } else {
          throw error;
        }
      }
      
      // Отправляем сообщение
      const response = await api.post(`/chat/${conversationId}/messages`, {
        role: role,
        content: message,
        meta: meta || { timestamp: new Date().toISOString() }
      });
      
      debug.log('✅ Сообщение отправлено с ролью:', role);
      
      // Принудительно сохраняем обновленный conversation ID
      this.forceUpdateConversationId(conversationId);
      
      return { conversationId, success: true, data: response.data };
    } catch (error) {
      debug.error('❌ Ошибка отправки сообщения:', error);
      throw error;
    }
  },
  
  // Получить список conversations
  async getConversations() {
    try {
      debug.log('📋 Получаем список conversations...');
      const response = await api.get('/chat/list');
      debug.log('✅ Conversations получены:', response.data);
      return response.data;
    } catch (error: any) {
      debug.error('❌ Ошибка получения списка conversations:', error);
      
      if (error.response?.status === 401) {
        // Нет сессии, создаем новую
        debug.log('🔄 Нет сессии, создаем новую...');
        await this.createNewConversation();
        return [];
      }
      
      return [];
    }
  },
  
  // Проверить существование conversation
  async checkConversationExists(conversationId: string): Promise<boolean> {
    try {
      await api.get(`/chat/${conversationId}/messages`, { params: { limit: 1 } });
      return true;
    } catch (error: any) {
      return error.response?.status !== 404;
    }
  },
  
  // Получить или создать conversation
  async getOrCreateConversation(existingId?: string) {
    if (existingId) {
      const exists = await this.checkConversationExists(existingId);
      if (exists) {
        debug.log('✅ Используем существующую conversation:', existingId);
        return existingId;
      }
    }
    
    debug.log('🆕 Создаем новую conversation...');
    const newData = await this.createNewConversation();
    return newData.conversation_id;
  },
  
  // Получить текущую conversation ID из localStorage
  getCurrentConversationId(): string | null {
    const id = localStorage.getItem('conversationId');
    debug.log('📖 Получаем conversation ID из localStorage:', id);
    return id;
  },
  
  // Очистить conversation
  clearConversation() {
    debug.log('🧹 Очищаем conversation...');
    debug.log('🧹 Старый ID перед очисткой:', localStorage.getItem('conversationId'));
    localStorage.removeItem('conversationId');
    localStorage.removeItem('hoa_chat_cid'); // Дополнительная очистка
    debug.log('🧹 ID после очистки:', localStorage.getItem('conversationId'));
  },
  
  // Принудительно обновить conversation ID
  forceUpdateConversationId(newId: string) {
    debug.log('🔄 Принудительно обновляем conversation ID на:', newId);
    debug.log('🔄 Старый ID в localStorage:', localStorage.getItem('conversationId'));
    localStorage.setItem('conversationId', newId);
    debug.log('✅ Новый ID сохранен в localStorage:', newId);
  }
};
