/**
 * Вспомогательные функции для редактора рисования и других компонентов
 */

// Функция для безопасного вызова других функций
function safeCall(fn, ...args) {
  if (typeof fn === 'function') {
    return fn(...args);
  }
  return undefined;
}

// Функция для проверки существования элемента
function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

// Функция для отображения модальных окон
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    return true;
  }
  return false;
}

// Функция для скрытия модальных окон
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    return true;
  }
  return false;
}

// Глобальные функции
window.safeCall = safeCall;
window.elementExists = elementExists;
window.showModal = showModal;
window.hideModal = hideModal;
