/**
 * Главный модуль приложения
 * Инициализирует все компоненты и связывает их вместе
 */

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Загружаем настройки
  loadSettings();
  
  // Инициализируем редактор
  initEditor();
  
  // Загружаем умные макросы
  loadSmartMacros();
  
  // Инициализируем редактор рисования
  initDrawingEditor();
  
  // Устанавливаем обработчики событий для элементов интерфейса
  setupUIEventHandlers();
  
  // Загружаем начальный документ
  loadInitialDocument();
  
  // Компилируем при первой загрузке
  setTimeout(compileLatex, 500);
});

/**
 * Настройка обработчиков событий для UI элементов
 */
function setupUIEventHandlers() {
  // Установка обработчиков для панели инструментов
  setupToolbarButtons();
  
  // Установка обработчиков для модальных окон
  setupModalEvents();
  
  // Установка обработчиков для файлового менеджера
  setupFileManagerEvents();
  
  // Установка обработчиков для умных макросов
  setupSmartMacrosEvents();
  
  // Установка обработчиков для настроек
  setupSettingsEvents();
  
  // Установка обработчиков для предпросмотра
  setupPreviewEvents();
}

/**
 * Настройка обработчиков событий для модальных окон
 */
function setupModalEvents() {
  // Закрытие модальных окон при клике на крестик
  document.querySelectorAll('.modal .close').forEach(function(closeBtn) {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  // Закрытие модальных окон при клике вне их
  window.addEventListener('click', function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}
