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
  // Инициализация модуля рисования на PDF
if (typeof window.PDFDrawing?.initialize === 'function') {
  window.PDFDrawing.initialize();
} else {
  console.warn('Модуль PDFDrawing не определен или не имеет метода initialize');
}

/**
 * Добавьте следующий код в конец файла main.js
 */

/**
 * Публикует событие перед компиляцией LaTeX
 * Обертка для стандартной функции compileLatex
 */
function setupCompileLatexWrapper() {
  // Проверяем, существует ли оригинальная функция
  if (typeof window.compileLatex === 'function') {
    // Сохраняем оригинальную функцию
    const originalCompileLatex = window.compileLatex;
    
    // Переопределяем функцию
    window.compileLatex = function() {
      // Публикуем событие перед компиляцией
      document.dispatchEvent(new CustomEvent('before-latex-compile'));
      
      // Вызываем оригинальную функцию
      const result = originalCompileLatex.apply(this, arguments);
      
      // После некоторой задержки, публикуем событие завершения компиляции
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('after-latex-compile'));
      }, 1000); // Задержка в 1 секунду для завершения рендеринга
      
      return result;
    };
  }
}

// Вызываем функцию настройки обертки для compileLatex
document.addEventListener('DOMContentLoaded', function() {
  setupCompileLatexWrapper();
});
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

// Проверяем, что все необходимые функции доступны
document.addEventListener('DOMContentLoaded', function() {
  console.log('Проверка модулей рисования...');
  
  // Проверяем наличие необходимых функций
  if (typeof window.initDrawingEditor !== 'function') {
    console.error('Функция initDrawingEditor не определена!');
  }
  
  if (typeof window.openDrawingEditor !== 'function') {
    console.error('Функция openDrawingEditor не определена, создаем её');
    
    // Создаем глобальную функцию openDrawingEditor
    window.openDrawingEditor = function() {
      console.log('Вызов функции openDrawingEditor');
      
      // Проверяем, существует ли модальное окно рисования
      if (!document.getElementById('drawing-modal')) {
        console.log('Модальное окно рисования не найдено, инициализируем UI');
        if (typeof window.initDrawingUI === 'function') {
          window.initDrawingUI();
        } else if (typeof initDrawingUI === 'function') {
          initDrawingUI();
        } else {
          console.error('Функция initDrawingUI недоступна!');
          alert('Ошибка: Модуль рисования не может быть инициализирован');
          return;
        }
      }
      
      // Отображаем модальное окно
      const modal = document.getElementById('drawing-modal');
      if (modal) {
        modal.style.display = 'block';
        
        // Инициализируем canvas
        if (typeof window.drawingCanvas?.init === 'function') {
          window.drawingCanvas.init();
        } else if (typeof initDrawingCanvas === 'function') {
          initDrawingCanvas();
        } else {
          console.warn('Не удалось инициализировать canvas для рисования');
        }
        
        // Инициализируем инструменты
        if (typeof window.drawingTools?.init === 'function') {
          window.drawingTools.init();
        } else if (typeof initDrawingTools === 'function') {
          initDrawingTools();
        } else {
          console.warn('Не удалось инициализировать инструменты рисования');
        }
      } else {
        console.error('Модальное окно рисования не найдено после инициализации!');
        alert('Ошибка: Не удалось открыть редактор рисования');
      }
    };
  }
  
  // Явно инициализируем редактор рисования
  if (typeof window.initDrawingEditor === 'function') {
    window.initDrawingEditor();
    console.log('Редактор рисования инициализирован');
  }
  
  // Убедимся, что обработчик кнопки рисования установлен
  const drawingBtn = document.getElementById('drawing-btn');
  if (drawingBtn) {
    // Удаляем все предыдущие обработчики, чтобы избежать дублирования
    const newBtn = drawingBtn.cloneNode(true);
    drawingBtn.parentNode.replaceChild(newBtn, drawingBtn);
    
    // Добавляем обработчик события
    newBtn.addEventListener('click', function() {
      console.log('Кнопка рисования нажата');
      if (typeof window.openDrawingEditor === 'function') {
        window.openDrawingEditor();
      } else {
        console.error('Функция openDrawingEditor не определена');
        alert('Ошибка: Функция редактора рисования недоступна');
      }
    });
  } else {
    console.warn('Кнопка рисования не найдена в DOM');
  }
});
