/**
 * Вспомогательные функции для всего приложения
 */

// Функция открытия редактора рисования
function openDrawingEditor() {
  console.log('Открываем редактор рисования');
  
  // Проверяем, существует ли модальное окно
  if (!document.getElementById('drawing-modal')) {
    console.log('Модальное окно редактора рисования не найдено, создаем его');
    if (typeof initDrawingUI === 'function') {
      initDrawingUI();
    } else {
      console.error('Функция initDrawingUI не определена');
    }
  }
  
  // Отображаем модальное окно
  const modal = document.getElementById('drawing-modal');
  if (modal) {
    modal.style.display = 'block';
  }
  
  // Инициализируем canvas
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
}

// Глобальная функция для доступа к функции открытия редактора
window.openDrawingEditor = openDrawingEditor;
