/**
 * Модуль редактора рисования
 * Основной файл, координирующий работу всего редактора рисования
 * и его интеграцию с редактором LaTeX
 */

// Глобальная переменная для доступа к редактору рисования
let drawingEditor;

/**
 * Инициализация редактора рисования
 */
function initDrawingEditor() {
  // Инициализируем пользовательский интерфейс
  if (typeof initDrawingUI === 'function') {
    initDrawingUI();
  } else {
    console.warn('Функция initDrawingUI не определена');
  }
  
  // Создаем объект редактора
  drawingEditor = {
    // Текущее состояние редактора
    isOpen: false,
    
    // Открывает редактор рисования
    open: function() {
      this.isOpen = true;
      
      // Отображаем модальное окно
      document.getElementById('drawing-modal').style.display = 'block';
      
      // Инициализируем canvas при открытии
      if (typeof initDrawingCanvas === 'function') {
        initDrawingCanvas();
      } else {
        console.warn('Функция initDrawingCanvas не определена');
      }
      
      // Инициализируем инструменты
      if (typeof initDrawingTools === 'function') {
        initDrawingTools();
      } else {
        console.warn('Функция initDrawingTools не определена');
      }
    },
    
    // Закрывает редактор рисования без сохранения
    close: function() {
      this.isOpen = false;
      document.getElementById('drawing-modal').style.display = 'none';
      
      // Очищаем canvas
      if (typeof clearDrawingCanvas === 'function') {
        clearDrawingCanvas();
      } else {
        console.warn('Функция clearDrawingCanvas не определена');
      }
    },
    
    // Вставляет сгенерированный TikZ-код в редактор LaTeX
    insertDrawing: function() {
      // Получаем TikZ-код
      if (typeof convertToTikZ !== 'function') {
        console.warn('Функция convertToTikZ не определена');
        return;
      }
      
      const tikzCode = convertToTikZ();
      
      // Получаем позицию курсора в редакторе LaTeX
      const cursor = editor.getCursor();
      
      // Формируем код с окружением tikzpicture
      const fullCode = `\\begin{tikzpicture}\n${tikzCode}\n\\end{tikzpicture}`;
      
      // Вставляем в редактор
      editor.replaceRange(fullCode, cursor);
      
      // Закрываем редактор рисования
      this.close();
      
      // Обновляем статус
      if (typeof updateStatus === 'function') {
        updateStatus('Рисунок вставлен');
      } else {
        console.warn('Функция updateStatus не определена');
      }
    }
  };
  
  // Устанавливаем обработчики событий
  setupDrawingEditorEvents();
  
  // Делаем функцию открытия редактора доступной глобально
  window.openDrawingEditor = function() {
    if (drawingEditor) {
      drawingEditor.open();
    } else {
      console.error('Редактор рисования не инициализирован');
    }
  };
}

/**
 * Устанавливает обработчики событий для редактора рисования
 */
function setupDrawingEditorEvents() {
  // Кнопка открытия редактора
  const drawingBtn = document.getElementById('drawing-btn');
  if (drawingBtn) {
    drawingBtn.addEventListener('click', function() {
      if (typeof openDrawingEditor === 'function') {
        openDrawingEditor();
      } else if (drawingEditor) {
        drawingEditor.open();
      } else {
        console.error('Функция openDrawingEditor или объект drawingEditor не определены');
      }
    });
  } else {
    console.warn('Элемент drawing-btn не найден');
  }
}

// Экспортируем функцию в глобальную область видимости
window.initDrawingEditor = initDrawingEditor;
window.openDrawingEditor = function() {
  if (drawingEditor) {
    drawingEditor.open();
  } else {
    console.log('Инициализация редактора рисования...');
    initDrawingEditor();
    if (drawingEditor) {
      drawingEditor.open();
    }
  }
};
