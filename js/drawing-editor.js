/**
 * Вспомогательный файл для редактора рисования
 * Чтобы избежать ошибок, вся функциональность перенесена в helpers.js
 */

// Предотвращаем ошибки, создавая пустую функцию
function initDrawingEditor() {
  console.log("Инициализация редактора рисования из drawing-editor.js (пустая функция)");
  
  // Убеждаемся, что функция openDrawingEditor доступна глобально
  if (typeof window.openDrawingEditor !== 'function') {
    window.openDrawingEditor = function() {
      console.log("Вызов функции openDrawingEditor из drawing-editor.js");
      
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
        
        // Инициализируем canvas
        if (typeof window.drawingCanvas?.init === 'function') {
          window.drawingCanvas.init();
        } else if (typeof initDrawingCanvas === 'function') {
          initDrawingCanvas();
        } else {
          console.warn('Функции для инициализации canvas не найдены');
        }
        
        // Инициализируем инструменты
        if (typeof window.drawingTools?.init === 'function') {
          window.drawingTools.init();
        } else if (typeof initDrawingTools === 'function') {
          initDrawingTools();
        } else {
          console.warn('Функции для инициализации инструментов рисования не найдены');
        }
      } else {
        console.error('Не удалось найти или создать модальное окно редактора');
      }
    };
  }
}

// Экспортируем функцию в глобальную область видимости
window.initDrawingEditor = initDrawingEditor;
