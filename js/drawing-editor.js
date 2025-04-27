/**
 * drawing-editor.js
 * Отвечает за инициализацию и координацию работы редактора рисования
 */

/**
 * Инициализирует редактор рисования
 */
function initDrawingEditor() {
  console.log("Инициализация редактора рисования");
  
  // Убеждаемся, что функция openDrawingEditor доступна глобально
  window.openDrawingEditor = function() {
    console.log("Вызвана функция openDrawingEditor");
    
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
        console.log('Инициализация canvas через window.drawingCanvas.init');
        window.drawingCanvas.init();
      } else if (typeof initDrawingCanvas === 'function') {
