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
  initDrawingUI();
  
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
      initDrawingCanvas();
      
      // Инициализируем инструменты
      initDrawingTools();
    },
    
    // Закрывает редактор рисования без сохранения
    close: function() {
      this.isOpen = false;
      document.getElementById('drawing-modal').style.display = 'none';
      
      // Очищаем canvas
      clearDrawingCanvas();
    },
    
    // Вставляет сгенерированный TikZ-код в редактор LaTeX
    insertDrawing: function() {
      // Получаем TikZ-код
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
      updateStatus('Рисунок вставлен');
    }
  };
  
  // Устанавливаем обработчики событий
  setupDrawingEditorEvents();
}

/**
 * Устанавливает обработчики событий для редактора рисования
 */
function setupDrawingEditorEvents() {
  // Кнопка открытия редактора
  document.getElementById('drawing-btn').addEventListener('click', function() {
    openDrawingEditor();
  });
}

/**
 * Открывает редактор рисования
 */
function openDrawingEditor() {
  if (drawingEditor) {
    drawingEditor.open();
  }
}
