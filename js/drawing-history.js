/**
 * drawing-history.js
 * Модуль для управления историей действий (Undo/Redo)
 */

// Максимальный размер истории
const MAX_HISTORY_SIZE = 50;

// Массивы для хранения истории
let undoStack = [];
let redoStack = [];

// Текущее состояние
let currentState = [];

/**
 * Инициализирует модуль истории
 */
function initDrawingHistory() {
  // Очищаем историю
  undoStack = [];
  redoStack = [];
  
  // Создаем UI элементы для Undo/Redo
  createHistoryUI();
  
  // Устанавливаем обработчики событий
  setupHistoryEvents();
}

/**
 * Создает UI элементы для Undo/Redo
 */
function createHistoryUI() {
  // Получаем панель действий
  const actionsPanel = document.querySelector('.drawing-actions');
  if (!actionsPanel) return;
  
  // Создаем кнопки Undo/Redo
  const undoButton = document.createElement('button');
  undoButton.id = 'drawing-undo';
  undoButton.className = 'secondary-btn';
  undoButton.disabled = true;
  undoButton.setAttribute('title', 'Отменить (Ctrl+Z)');
  undoButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
    </svg>
    Отменить
  `;
  
  const redoButton = document.createElement('button');
  redoButton.id = 'drawing-redo';
  redoButton.className = 'secondary-btn';
  redoButton.disabled = true;
  redoButton.setAttribute('title', 'Повторить (Ctrl+Y)');
  redoButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M18.4,10.6C16.55,9 14.15,8 11.5,8C6.85,8 2.92,11.03 1.54,15.22L3.9,16C4.95,12.81 7.95,10.5 11.5,10.5C13.45,10.5 15.23,11.22 16.62,12.38L13,16H22V7L18.4,10.6Z" />
    </svg>
    Повторить
  `;
  
  // Вставляем кнопки в начало панели действий
  actionsPanel.insertBefore(redoButton, actionsPanel.firstChild);
  actionsPanel.insertBefore(undoButton, actionsPanel.firstChild);
}

/**
 * Устанавливает обработчики событий для Undo/Redo
 */
function setupHistoryEvents() {
  // Обработчики для кнопок
  const undoButton = document.getElementById('drawing-undo');
  const redoButton = document.getElementById('drawing-redo');
  
  if (undoButton) {
    undoButton.addEventListener('click', undoAction);
  }
  
  if (redoButton) {
    redoButton.addEventListener('click', redoAction);
  }
  
  // Обработчики клавиатурных сокращений
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undoAction();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
      e.preventDefault();
      redoAction();
    }
  });
}

/**
 * Сохраняет состояние в историю
 * @param {Array} elements - текущие элементы рисования
 */
function saveState(elements) {
  // Создаем глубокую копию текущего состояния
  const stateCopy = JSON.parse(JSON.stringify(elements));
  
  // Проверяем, изменилось ли состояние
  if (isStateChanged(stateCopy, currentState)) {
    // Добавляем состояние в стек отмены
    undoStack.push(currentState);
    
    // Очищаем стек повтора при новом действии
    redoStack = [];
    
    // Обновляем текущее состояние
    currentState = stateCopy;
    
    // Ограничиваем размер стека
    if (undoStack.length > MAX_HISTORY_SIZE) {
      undoStack.shift();
    }
    
    // Обновляем UI
    updateHistoryButtons();
  }
}

/**
 * Проверяет, изменилось ли состояние
 * @param {Array} newState - новое состояние
 * @param {Array} oldState - старое состояние
 * @returns {boolean} - true, если состояние изменилось
 */
function isStateChanged(newState, oldState) {
  // Если предыдущего состояния нет, считаем что состояние изменилось
  if (!oldState || oldState.length !== newState.length) {
    return true;
  }
  
  // Для простоты сравниваем строковые представления
  return JSON.stringify(newState) !== JSON.stringify(oldState);
}

/**
 * Выполняет отмену действия
 */
function undoAction() {
  if (undoStack.length === 0) return;
  
  // Сохраняем текущее состояние в стек повтора
  redoStack.push(currentState);
  
  // Восстанавливаем предыдущее состояние
  const previousState = undoStack.pop();
  currentState = previousState;
  
  // Обновляем элементы рисования
  applyState(previousState);
  
  // Обновляем UI
  updateHistoryButtons();
}

/**
 * Выполняет повтор действия
 */
function redoAction() {
  if (redoStack.length === 0) return;
  
  // Сохраняем текущее состояние в стек отмены
  undoStack.push(currentState);
  
  // Восстанавливаем следующее состояние
  const nextState = redoStack.pop();
  currentState = nextState;
  
  // Обновляем элементы рисования
  applyState(nextState);
  
  // Обновляем UI
  updateHistoryButtons();
}

/**
 * Применяет состояние к элементам рисования
 * @param {Array} state - состояние для применения
 */
function applyState(state) {
  // Обновляем глобальную переменную элементов
  window.drawingElements = state;
  
  // Перерисовываем canvas
  if (typeof window.redrawCanvas === 'function') {
    window.redrawCanvas();
  }
}

/**
 * Обновляет состояние кнопок истории
 */
function updateHistoryButtons() {
  const undoButton = document.getElementById('drawing-undo');
  const redoButton = document.getElementById('drawing-redo');
  
  if (undoButton) {
    undoButton.disabled = undoStack.length === 0;
  }
  
  if (redoButton) {
    redoButton.disabled = redoStack.length === 0;
  }
}

/**
 * Очищает историю
 */
function clearHistory() {
  undoStack = [];
  redoStack = [];
  currentState = [];
  
  // Обновляем UI
  updateHistoryButtons();
}

// Экспортируем функции для использования в других файлах
window.drawingHistory = {
  init: initDrawingHistory,
  saveState: saveState,
  undo: undoAction,
  redo: redoAction,
  clear: clearHistory
};
