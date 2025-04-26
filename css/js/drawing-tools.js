/**
 * Модуль инструментов рисования
 * Отвечает за управление инструментами рисования и их настройками
 */

// Текущий инструмент рисования
let currentTool = 'freehand';

// Текущие настройки инструментов
let toolSettings = {
  color: '#000000',
  lineWidth: 2,
  fill: 'transparent',
  fontSize: 16,
  fontFamily: 'Arial'
};

// Давление стилуса (для поддержки стилуса)
let currentPressure = 1.0;

/**
 * Инициализирует инструменты рисования
 */
function initDrawingTools() {
  // Устанавливаем начальный инструмент
  selectTool('freehand');
  
  // Устанавливаем начальные настройки
  updateToolSettings();
  
  // Устанавливаем обработчики событий для инструментов
  setupToolEvents();
}

/**
 * Устанавливает обработчики событий для инструментов
 */
function setupToolEvents() {
  // Обработчики для кнопок инструментов
  document.querySelectorAll('.drawing-tool').forEach(button => {
    button.addEventListener('click', function() {
      const tool = this.getAttribute('data-tool');
      selectTool(tool);
    });
  });
  
  // Обработчик для выбора цвета
  document.getElementById('drawing-color').addEventListener('change', function() {
    toolSettings.color = this.value;
  });
  
  // Обработчик для толщины линии
  document.getElementById('drawing-line-width').addEventListener('input', function() {
    toolSettings.lineWidth = parseInt(this.value);
    // Обновляем отображение текущего значения
    document.getElementById('line-width-value').textContent = toolSettings.lineWidth;
  });
  
  // Обработчик для цвета заливки
  document.getElementById('drawing-fill').addEventListener('change', function() {
    toolSettings.fill = this.value;
  });
  
  // Переключатель заливки
  document.getElementById('drawing-fill-enabled').addEventListener('change', function() {
    const fillColor = document.getElementById('drawing-fill');
    if (this.checked) {
      fillColor.disabled = false;
      toolSettings.fill = fillColor.value;
    } else {
      fillColor.disabled = true;
      toolSettings.fill = 'transparent';
    }
  });
  
  // Обработчик для размера шрифта
  document.getElementById('drawing-font-size').addEventListener('input', function() {
    toolSettings.fontSize = parseInt(this.value);
    // Обновляем отображение
    document.getElementById('font-size-value').textContent = toolSettings.fontSize;
  });
  
  // Обработчик для очистки холста
  document.getElementById('drawing-clear').addEventListener('click', function() {
    if (confirm('Вы уверены, что хотите очистить холст?')) {
      clearDrawingCanvas();
    }
  });
}

/**
 * Выбирает активный инструмент
 * @param {string} tool - имя инструмента
 */
function selectTool(tool) {
  // Обновляем текущий инструмент
  currentTool = tool;
  
  // Обновляем UI
  document.querySelectorAll('.drawing-tool').forEach(button => {
    button.classList.remove('active');
  });
  
  const toolButton = document.querySelector(`.drawing-tool[data-tool="${tool}"]`);
  if (toolButton) {
    toolButton.classList.add('active');
  }
  
  // Показываем/скрываем дополнительные настройки в зависимости от инструмента
  updateToolOptions();
}

/**
 * Обновляет настройки инструментов в UI
 */
function updateToolSettings() {
  // Обновляем элементы UI
  document.getElementById('drawing-color').value = toolSettings.color;
  document.getElementById('drawing-line-width').value = toolSettings.lineWidth;
  document.getElementById('line-width-value').textContent = toolSettings.lineWidth;
  
  const fillEnabled = toolSettings.fill !== 'transparent';
  document.getElementById('drawing-fill-enabled').checked = fillEnabled;
  document.getElementById('drawing-fill').disabled = !fillEnabled;
  document.getElementById('drawing-fill').value = fillEnabled ? toolSettings.fill : '#ffffff';
  
  document.getElementById('drawing-font-size').value = toolSettings.fontSize;
  document.getElementById('font-size-value').textContent = toolSettings.fontSize;
}

/**
 * Обновляет видимость опций инструментов в зависимости от текущего инструмента
 */
function updateToolOptions() {
  // Скрываем все опции сначала
  document.querySelectorAll('.tool-option').forEach(option => {
    option.style.display = 'none';
  });
  
  // Показываем общие опции
  document.getElementById('color-option').style.display = 'block';
  document.getElementById('line-width-option').style.display = 'block';
  
  // Показываем специфичные опции в зависимости от инструмента
  switch (currentTool) {
    case 'freehand':
      // Для свободного рисования нужны только цвет и толщина линии
      break;
    case 'line':
    case 'arrow':
      // Для линий и стрелок нужны цвет и толщина линии
      break;
    case 'rectangle':
    case 'ellipse':
      // Для фигур нужны цвет, толщина линии и заливка
      document.getElementById('fill-option').style.display = 'block';
      break;
    case 'text':
      // Для текста нужны цвет, размер шрифта и т.д.
      document.getElementById('font-option').style.display = 'block';
      document.getElementById('line-width-option').style.display = 'none';
      break;
  }
}

/**
 * Создает новый элемент рисования
 * @param {number} x - начальная координата X
 * @param {number} y - начальная координата Y
 * @returns {Object} - новый элемент рисования
 */
function createDrawingElement(x, y) {
  // Базовый объект элемента
  const element = {
    type: currentTool,
    color: toolSettings.color,
    lineWidth: toolSettings.lineWidth * currentPressure
  };
  
  // Дополняем объект в зависимости от типа
  switch (currentTool) {
    case 'freehand':
      element.points = [];
      break;
    case 'line':
    case 'rectangle':
    case 'ellipse':
    case 'arrow':
      element.startX = x;
      element.startY = y;
      element.endX = x;
      element.endY = y;
      
      // Для прямоугольника и эллипса добавляем заливку
      if (currentTool === 'rectangle' || currentTool === 'ellipse') {
        element.fill = toolSettings.fill;
      }
      break;
    case 'text':
      element.x = x;
      element.y = y;
      element.text = prompt('Введите текст:', '');
      element.fontSize = toolSettings.fontSize;
      element.fontFamily = toolSettings.fontFamily;
      break;
  }
  
  return element;
}

/**
 * Обновляет текущий элемент во время рисования
 * @param {Object} element - текущий элемент
 * @param {number} x - текущая координата X
 * @param {number} y - текущая координата Y
 */
function updateDrawingElement(element, x, y) {
  if (!element) return;
  
  switch (element.type) {
    case 'freehand':
      element.points.push({ x, y });
      break;
    case 'line':
    case 'rectangle':
    case 'ellipse':
    case 'arrow':
      element.endX = x;
      element.endY = y;
      break;
    case 'text':
      // Для текста не нужно обновление
      break;
  }
}
