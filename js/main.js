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
  if (typeof initDrawingEditor === 'function') {
    initDrawingEditor();
  } else {
    console.warn('Функция initDrawingEditor не определена');
  }
  
  // Устанавливаем обработчики событий для элементов интерфейса
  setupUIEventHandlers();
  
  // Загружаем начальный документ
  loadInitialDocument();
  
  // Компилируем при первой загрузке
  setTimeout(() => {
    if (typeof compileLatex === 'function') {
      compileLatex();
    } else {
      console.error('Функция compileLatex не определена');
    }
  }, 500);
});

/**
 * Настройка обработчиков событий для UI элементов
 */
function setupUIEventHandlers() {
  const drawingBtn = document.getElementById('drawing-btn');
if (drawingBtn) {
  drawingBtn.addEventListener('click', function() {
    console.log('Кнопка рисования нажата');
    if (typeof openDrawingEditor === 'function') {
      openDrawingEditor();
    } else {
      console.error('Функция openDrawingEditor не определена');
    }
  });
}
  
  if (typeof window.drawingHistory?.init === 'function') {
  window.drawingHistory.init();
} else {
  console.warn('Функция window.drawingHistory.init не определена');
}
  // Установка обработчиков для панели инструментов
  if (typeof setupToolbarButtons === 'function') {
    setupToolbarButtons();
  } else {
    console.warn('Функция setupToolbarButtons не определена');
  }
  
  // Установка обработчиков для модальных окон
  setupModalEvents();
  
  // Установка обработчиков для файлового менеджера
  if (typeof setupFileManagerEvents === 'function') {
    setupFileManagerEvents();
  } else {
    console.warn('Функция setupFileManagerEvents не определена');
  }
  
  // Установка обработчиков для умных макросов
  if (typeof setupSmartMacrosEvents === 'function') {
    setupSmartMacrosEvents();
  } else {
    console.warn('Функция setupSmartMacrosEvents не определена');
  }
  
  // Установка обработчиков для настроек
  if (typeof setupSettingsEvents === 'function') {
    setupSettingsEvents();
  } else {
    console.warn('Функция setupSettingsEvents не определена');
  }
  
  // Установка обработчиков для предпросмотра
  if (typeof setupPreviewEvents === 'function') {
    setupPreviewEvents();
  } else {
    console.warn('Функция setupPreviewEvents не определена');
  }
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
