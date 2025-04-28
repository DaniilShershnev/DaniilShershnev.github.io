/**
 * Улучшенная версия редактора рисования
 * Решает проблему дублирования инструментов при открытии/закрытии редактора
 * Замените содержимое файла js/drawing-editor.js
 */

/**
 * drawing-editor.js
 * Отвечает за инициализацию и координацию работы редактора рисования
 */

// Флаг, указывающий, был ли уже инициализирован редактор
let isDrawingEditorInitialized = false;

/**
 * Инициализирует редактор рисования
 */
function initDrawingEditor() {
  // Если редактор уже инициализирован, не делаем этого снова
  if (isDrawingEditorInitialized) {
    console.log("Редактор рисования уже инициализирован");
    return;
  }
  
  console.log("Инициализация редактора рисования");
  
  // Убеждаемся, что функция openDrawingEditor доступна глобально
  window.openDrawingEditor = function(isPdfDrawingMode = false) {
    console.log("Вызвана функция openDrawingEditor, режим PDF:", isPdfDrawingMode);
    
    // Проверяем, существует ли модальное окно
    if (!document.getElementById('drawing-modal')) {
      console.log('Модальное окно редактора не найдено, создаем его');
      if (typeof initDrawingUI === 'function') {
        initDrawingUI();
      } else {
        console.error('Функция initDrawingUI не определена');
        return;
      }
    }
    
    // Отображаем модальное окно
    const modal = document.getElementById('drawing-modal');
    if (modal) {
      modal.style.display = 'block';
      
      // Устанавливаем атрибут, указывающий на режим рисования на PDF
      if (isPdfDrawingMode) {
        modal.setAttribute('data-pdf-drawing-mode', 'true');
        // Настраиваем редактор для режима PDF
        if (typeof window.PDFInsertionHandler?.setupDrawingEditorForPdfMode === 'function') {
          window.PDFInsertionHandler.setupDrawingEditorForPdfMode();
        }
      } else {
        modal.removeAttribute('data-pdf-drawing-mode');
      }
      
      // Инициализируем canvas
      if (typeof window.drawingCanvas?.init === 'function') {
        console.log('Инициализация canvas через window.drawingCanvas.init');
        window.drawingCanvas.init();
      } else if (typeof initDrawingCanvas === 'function') {
        console.log('Инициализация canvas через initDrawingCanvas');
        initDrawingCanvas();
      } else {
        console.warn('Функции для инициализации canvas не найдены');
      }
      
      // Инициализируем инструменты
      if (typeof window.drawingTools?.init === 'function') {
        console.log('Инициализация инструментов через window.drawingTools.init');
        window.drawingTools.init();
      } else if (typeof initDrawingTools === 'function') {
        console.log('Инициализация инструментов через initDrawingTools');
        initDrawingTools();
      } else {
        console.warn('Функции для инициализации инструментов рисования не найдены');
      }
      
      // Инициализируем историю
      if (typeof window.drawingHistory?.init === 'function') {
        console.log('Инициализация истории через window.drawingHistory.init');
        window.drawingHistory.init();
      }
    } else {
      console.error('Не удалось найти или создать модальное окно редактора');
    }
  };
  
  /**
   * Проверяет, открыт ли редактор рисования в режиме рисования на PDF
   * @returns {boolean} - true, если редактор открыт в режиме рисования на PDF
   */
  function isDrawingEditorInPdfMode() {
    const modal = document.getElementById('drawing-modal');
    if (!modal) return false;
    
    return modal.hasAttribute('data-pdf-drawing-mode');
  }

  // Экспортируем функцию
  window.isDrawingEditorInPdfMode = isDrawingEditorInPdfMode;
  
  // Устанавливаем флаг инициализации
  isDrawingEditorInitialized = true;
  
  console.log("Редактор рисования инициализирован успешно");
}

/**
 * Добавляет отладочные сообщения в модальное окно
 * @param {string} message - сообщение для отображения
 */
function debugLog(message) {
  console.log(message);
  
  // Создаем элемент для вывода отладочной информации, если его нет
  let debugElement = document.getElementById('drawing-debug');
  if (!debugElement) {
    const container = document.getElementById('drawing-canvas-container');
    if (container) {
      debugElement = document.createElement('div');
      debugElement.id = 'drawing-debug';
      debugElement.style.position = 'absolute';
      debugElement.style.bottom = '5px';
      debugElement.style.left = '5px';
      debugElement.style.background = 'rgba(0,0,0,0.7)';
      debugElement.style.color = 'white';
      debugElement.style.padding = '5px';
      debugElement.style.borderRadius = '3px';
      debugElement.style.fontSize = '12px';
      debugElement.style.fontFamily = 'monospace';
      debugElement.style.zIndex = '1000';
      debugElement.style.maxWidth = '80%';
      debugElement.style.maxHeight = '150px';
      debugElement.style.overflow = 'auto';
      container.appendChild(debugElement);
    }
  }
  
  if (debugElement) {
    const timeStamp = new Date().toLocaleTimeString();
    const logItem = document.createElement('div');
    logItem.textContent = `[${timeStamp}] ${message}`;
    debugElement.appendChild(logItem);
    
    // Прокручиваем до последнего сообщения
    debugElement.scrollTop = debugElement.scrollHeight;
    
    // Ограничиваем количество сообщений
    while (debugElement.children.length > 50) {
      debugElement.removeChild(debugElement.firstChild);
    }
  }
}

/**
 * Проверяет состояние инициализации редактора рисования
 * и выводит информацию о потенциальных проблемах
 */
function checkDrawingEditorState() {
  console.log("Проверка состояния редактора рисования");
  
  // Проверяем наличие canvas
  const canvas = document.getElementById('drawing-canvas');
  if (!canvas) {
    console.error('Canvas не найден!');
    return false;
  }
  
  // Проверяем доступность контекста
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('Не удалось получить контекст для canvas!');
    return false;
  }
  
  // Проверяем размеры canvas
  if (canvas.width === 0 || canvas.height === 0) {
    console.error('Canvas имеет нулевые размеры!');
    return false;
  }
  
  // Проверяем наличие обработчиков событий
  const events = ['mousedown', 'mousemove', 'mouseup'];
  let hasAllEvents = true;
  
  events.forEach(eventName => {
    if (getEventListeners(canvas, eventName).length === 0) {
      console.error(`Отсутствует обработчик события ${eventName} для canvas!`);
      hasAllEvents = false;
    }
  });
  
  // Проверяем наличие кнопок инструментов
  const tools = document.querySelectorAll('.drawing-tool');
  if (tools.length === 0) {
    console.error('Не найдены кнопки инструментов!');
    return false;
  }
  
  // Проверяем глобальные функции
  const requiredFunctions = [
    'redrawCanvas',
    'createDrawingElement',
    'updateDrawingElement'
  ];
  
  let hasFunctions = true;
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
      console.error(`Функция ${funcName} не определена!`);
      hasFunctions = false;
    }
  });
  
  if (hasAllEvents && hasFunctions) {
    console.log('Редактор рисования инициализирован корректно');
    return true;
  }
  
  return false;
}

/**
 * Получает все обработчики событий элемента
 * Вспомогательная функция для отладки
 * @param {HTMLElement} element - DOM-элемент
 * @param {string} eventName - имя события
 * @returns {Array} - массив обработчиков
 */
function getEventListeners(element, eventName) {
  // В обычных браузерах нет прямого способа получить список обработчиков
  // Это заглушка, которая просто возвращает пустой массив
  // В реальности мы не можем достоверно определить наличие обработчиков без инструментов разработчика
  return [];
}

// Экспортируем функции в глобальную область видимости
window.initDrawingEditor = initDrawingEditor;
window.debugLog = debugLog;
window.checkDrawingEditorState = checkDrawingEditorState;
