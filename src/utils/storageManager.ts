export const storageManager = {
  // Очистить все данные
  clearAll() {
    console.log('🧹 Очищаем все данные...');
    localStorage.clear();
    document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },
  
  // Очистить только conversation
  clearConversation() {
    console.log('🧹 Очищаем conversation...');
    localStorage.removeItem('conversationId');
  },
  
  // Сохранить conversation ID
  saveConversationId(id: string) {
    console.log('💾 Сохраняем conversation ID:', id);
    localStorage.setItem('conversationId', id);
  },
  
  // Получить conversation ID
  getConversationId(): string | null {
    const id = localStorage.getItem('conversationId');
    console.log('📖 Получаем conversation ID:', id);
    return id;
  },
  
  // Сохранить настройки
  saveSettings(settings: any) {
    console.log('💾 Сохраняем настройки:', settings);
    localStorage.setItem('chatSettings', JSON.stringify(settings));
  },
  
  // Получить настройки
  getSettings(): any {
    const settings = localStorage.getItem('chatSettings');
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch (error) {
        console.error('❌ Ошибка парсинга настроек:', error);
        return {};
      }
    }
    return {};
  }
};
