/**
 * drawing-tools.js
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
  fontFamily: 'Arial',
  arrowSize: 10,
  showGrid: true,
  snapToGrid: false,
  gridSize: 20
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
  
  // Создаем новые инструменты
  createExtendedTools();
}

/**
 * Создает расширенные инструменты
 */
function createExtendedTools() {
  // Получаем группу инструментов
  const toolsGroup = document.querySelector('.drawing-tools-group');
  if (!toolsGroup) return;
  
  // Добавляем новые инструменты
  
  // Кривая Безье
  const bezierButton = document.createElement('button');
  bezierButton.className = 'drawing-tool';
  bezierButton.setAttribute('data-tool', 'bezier');
  bezierButton.setAttribute('title', 'Кривая Безье');
  bezierButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M4,18C4,16.34 6.34,15 9,15C11.66,15 14,16.34 14,18H4M14,6C14,7.66 11.66,9 9,9C6.34,9 4,7.66 4,6H14M19,5C17.79,5 16.79,5.67 16.34,6.64C15.84,6.25 15.27,5.96 14.67,5.75C15.5,4.68 17.14,4 19,4V5M19,7C18.45,7 18,6.55 18,6C18,5.45 18.45,5 19,5C19.55,5 20,5.45 20,6C20,6.55 19.55,7 19,7M19,19C17.14,19 15.5,18.32 14.67,17.25C15.27,17.04 15.84,16.75 16.34,16.36C16.79,17.33 17.79,18 19,18V19M19,15C18.45,15 18,14.55 18,14C18,13.45 18.45,13 19,13C19.55,13 20,13.45 20,14C20,14.55 19.55,15 19,15Z" />
    </svg>
  `;
  toolsGroup.appendChild(bezierButton);
  
  // Многоугольник
  const polygonButton = document.createElement('button');
  polygonButton.className = 'drawing-tool';
  polygonButton.setAttribute('data-tool', 'polygon');
  polygonButton.setAttribute('title', 'Многоугольник');
  polygonButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M4,3H20A1,1 0 0,1 21,4V20A1,1 0 0,1 20,21H4A1,1 0 0,1 3,20V4A1,1 0 0,1 4,3M7.29,7.04L4.12,15.28L7.5,18.66L15.74,15.5L18.87,7.25L15.5,3.87L7.29,7.04M14.04,14.04L8.47,15.96L6.04,13.54L7.96,7.97L13.53,6.04L15.96,8.47L14.04,14.04Z" />
    </svg>
  `;
  toolsGroup.appendChild(polygonButton);
  
  // Кривая от руки с сглаживанием
  const smoothFreehandButton = document.createElement('button');
  smoothFreehandButton.className = 'drawing-tool';
  smoothFreehandButton.setAttribute('data-tool', 'smoothFreehand');
  smoothFreehandButton.setAttribute('title', 'Сглаженное рисование от руки');
  smoothFreehandButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M9.62,12L12,5.67L14.37,12M11,3L5.5,17H7.75L8.87,14H15.12L16.25,17H18.5L13,3H11Z" />
    </svg>
  `;
  toolsGroup.appendChild(smoothFreehandButton);
  
  // Выбор элементов
  const selectButton = document.createElement('button');
  selectButton.className = 'drawing-tool';
  selectButton.setAttribute('data-tool', 'select');
  selectButton.setAttribute('title', 'Выбрать и редактировать');
  selectButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M7,2L7,4L17,4L17,2L7,2M7,6L7,8L17,8L17,6L7,6M7,10L7,12L17,12L17,10L7,10M16,16L18,18H8L10,16H16M4.9,15.5L5.5,15.9L10.5,20.9L9.4,22L4.5,17H3V15.5H4.9M19.1,15.5L18.5,15.9L13.5,20.9L14.6,22L19.5,17H21V15.5H19.1Z" />
    </svg>
  `;
  toolsGroup.appendChild(selectButton);
  
  // Активируем события для новых инструментов
  document.querySelectorAll('.drawing-tool').forEach(button => {
    button.addEventListener('click', function() {
      const tool = this.getAttribute('data-tool');
      selectTool(tool);
    });
  });
  
  // Добавляем настройки для новых инструментов
  addExtendedSettings();
}

/**
 * Добавляет расширенные настройки
 */
function addExtendedSettings() {
  const settingsGroup = document.querySelector('.drawing-settings-group');
  if (!settingsGroup) return;
  
  // Добавляем настройки сетки
  const gridOption = document.createElement('div');
  gridOption.className = 'tool-option';
  gridOption.id = 'grid-option';
  gridOption.innerHTML = `
    <label>
      <input type="checkbox" id="drawing-grid-enabled" checked>
      Показать сетку
    </label>
    <label>
      <input type="checkbox" id="drawing-grid-snap">
      Привязка к сетке
    </label>
    <label for="drawing-grid-size">Размер сетки: <span id="grid-size-value">20</span>px</label>
    <input type="range" id="drawing-grid-size" min="5" max="50" value="20">
  `;
  settingsGroup.appendChild(gridOption);
  
  // Настройки для кривых Безье
  const bezierOption = document.createElement('div');
  bezierOption.className = 'tool-option';
  bezierOption.id = 'bezier-option';
  bezierOption.style.display = 'none';
  bezierOption.innerHTML = `
    <div class="bezier-info">Добавляйте контрольные точки кликами, нажмите Enter для завершения</div>
  `;
  settingsGroup.appendChild(bezierOption);
  
  // Настройки для многоугольника
  const polygonOption = document.createElement('div');
  polygonOption.className = 'tool-option';
  polygonOption.id = 'polygon-option';
  polygonOption.style.display = 'none';
  polygonOption.innerHTML = `
    <div class="polygon-info">Добавляйте вершины кликами, нажмите Enter для завершения</div>
  `;
  settingsGroup.appendChild(polygonOption);
  
  // Добавляем обработчики событий для настроек сетки
  document.getElementById('drawing-grid-enabled').addEventListener('change', function() {
    toolSettings.showGrid = this.checked;
    redrawCanvas();
  });
  
  document.getElementById('drawing-grid-snap').addEventListener('change', function() {
    toolSettings.snapToGrid = this.checked;
  });
  
  document.getElementById('drawing-grid-size').addEventListener('input', function() {
    toolSettings.gridSize = parseInt(this.value);
    document.getElementById('grid-size-value').textContent = toolSettings.gridSize;
    redrawCanvas();
  });
  
  // Добавляем кнопку полноэкранного режима
  const fullscreenButton = document.createElement('button');
  fullscreenButton.id = 'drawing-fullscreen';
  fullscreenButton.className = 'secondary-btn';
  fullscreenButton.setAttribute('title', 'Полноэкранный режим');
  fullscreenButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
    </svg>
    Развернуть
  `;
  
  // Добавляем его рядом с кнопкой очистки
  const clearButton = document.getElementById('drawing-clear');
  if (clearButton && clearButton.parentNode) {
    clearButton.parentNode.insertBefore(fullscreenButton, clearButton);
  } else {
    settingsGroup.appendChild(fullscreenButton);
  }
  
  // Флаг полноэкранного режима
  let isFullscreen = false;
  
  // Добавляем обработчик события для кнопки полноэкранного режима
  fullscreenButton.addEventListener('click', function() {
    isFullscreen = !isFullscreen;
    
    // Используем функцию из drawing-canvas.js для изменения размеров
    if (window.drawingCanvas && typeof window.drawingCanvas.setFullscreenMode === 'function') {
      window.drawingCanvas.setFullscreenMode(isFullscreen);
    }
    
    // Обновляем текст и иконку кнопки
    if (isFullscreen) {
      this.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5,14H7V19H12V17H7V14M7,10V5H12V3H5V10H7M17,17H12V19H19V12H17V17M12,7H17V12H19V5H12V7Z" />
        </svg>
        Свернуть
      `;
    } else {
      this.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
        </svg>
        Развернуть
      `;
    }
  });
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
  
  // Добавляем обработчики клавиш для многоугольника и кривой Безье
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === 'Escape') {
      if (currentTool === 'polygon' || currentTool === 'bezier') {
        finishMultiPointShape();
      }
    }
  });
}

/**
 * Завершает рисование многоточечной фигуры (многоугольник или кривая Безье)
 */
function finishMultiPointShape() {
  if (!currentElement) return;
  
  if (currentElement.points && currentElement.points.length > 1) {
    // Замыкаем многоугольник
    if (currentTool === 'polygon') {
      // Добавляем элемент в список
      drawingElements.push(currentElement);
      
      // Сохраняем состояние истории, если она доступна
      if (window.drawingHistory && typeof window.drawingHistory.saveState === 'function') {
        window.drawingHistory.saveState(drawingElements);
      }
    }
    // Для кривой Безье
    else if (currentTool === 'bezier') {
      // Добавляем элемент в список
      drawingElements.push(currentElement);
      
      // Сохраняем состояние истории, если она доступна
      if (window.drawingHistory && typeof window.drawingHistory.saveState === 'function') {
        window.drawingHistory.saveState(drawingElements);
      }
    }
  }
  
  // Сбрасываем текущий элемент
  currentElement = null;
  
  // Перерисовываем canvas
  redrawCanvas();
}

/**
 * Выбирает активный инструмент
 * @param {string} tool - имя инструмента
 */
function selectTool(tool) {
  // Если текущий инструмент - многоугольник или кривая Безье, завершаем его
  if ((currentTool === 'polygon' || currentTool === 'bezier') && currentElement) {
    finishMultiPointShape();
  }
  
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
  
  // Обновляем настройки сетки, если они существуют
  const gridEnabledElem = document.getElementById('drawing-grid-enabled');
  const gridSnapElem = document.getElementById('drawing-grid-snap');
  const gridSizeElem = document.getElementById('drawing-grid-size');
  
  if (gridEnabledElem) gridEnabledElem.checked = toolSettings.showGrid;
  if (gridSnapElem) gridSnapElem.checked = toolSettings.snapToGrid;
  if (gridSizeElem) {
    gridSizeElem.value = toolSettings.gridSize;
    document.getElementById('grid-size-value').textContent = toolSettings.gridSize;
  }
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
    case 'smoothFreehand':
      // Для свободного рисования нужны только цвет и толщина линии
      break;
    case 'line':
    case 'arrow':
      // Для линий и стрелок нужны цвет и толщина линии
      break;
    case 'rectangle':
    case 'ellipse':
    case 'polygon':
      // Для фигур нужны цвет, толщина линии и заливка
      document.getElementById('fill-option').style.display = 'block';
      if (currentTool === 'polygon') {
        document.getElementById('polygon-option').style.display = 'block';
      }
      break;
    case 'bezier':
      // Для кривой Безье
      document.getElementById('bezier-option').style.display = 'block';
      break;
    case 'text':
      // Для текста нужны цвет, размер шрифта и т.д.
      document.getElementById('font-option').style.display = 'block';
      document.getElementById('line-width-option').style.display = 'none';
      break;
    case 'select':
      // Для выбора элементов
      break;
  }
  
  // Всегда показываем настройки сетки
  const gridOption = document.getElementById('grid-option');
  if (gridOption) {
    gridOption.style.display = 'block';
  }
}

/**
 * Создает новый элемент рисования
 * @param {number} x - начальная координата X
 * @param {number} y - начальная координата Y
 * @returns {Object} - новый элемент рисования
 */
function createDrawingElement(x, y) {
  // Применяем привязку к сетке, если она включена
  if (toolSettings.snapToGrid) {
    x = Math.round(x / toolSettings.gridSize) * toolSettings.gridSize;
    y = Math.round(y / toolSettings.gridSize) * toolSettings.gridSize;
  }
  
  // Базовый объект элемента
  const element = {
    type: currentTool,
    color: toolSettings.color,
    lineWidth: toolSettings.lineWidth * currentPressure
  };
  
  // Дополняем объект в зависимости от типа
  switch (currentTool) {
    case 'freehand':
    case 'smoothFreehand':
      element.points = [];
      element.type = currentTool === 'smoothFreehand' ? 'smoothFreehand' : 'freehand';
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
      
      // Для стрелки добавляем размер наконечника
      if (currentTool === 'arrow') {
        element.arrowSize = toolSettings.arrowSize;
      }
      break;
    case 'polygon':
    case 'bezier':
      element.points = [{ x, y }];
      element.fill = toolSettings.fill;
      break;
    case 'text':
      element.x = x;
      element.y = y;
      element.text = prompt('Введите текст:', '');
      element.fontSize = toolSettings.fontSize;
      element.fontFamily = toolSettings.fontFamily;
      break;
    case 'select':
      // Для инструмента выбора не создаем новый элемент
      return null;
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
  
  // Применяем привязку к сетке, если она включена
  if (toolSettings.snapToGrid) {
    x = Math.round(x / toolSettings.gridSize) * toolSettings.gridSize;
    y = Math.round(y / toolSettings.gridSize) * toolSettings.gridSize;
  }
  
  switch (element.type) {
    case 'freehand':
    case 'smoothFreehand':
      element.points.push({ x, y });
      break;
    case 'line':
    case 'rectangle':
    case 'ellipse':
    case 'arrow':
      element.endX = x;
      element.endY = y;
      break;
    case 'polygon':
    case 'bezier':
      // Для многоточечных фигур, добавляем точку только если это новый клик мыши
      // Это будет обрабатываться отдельным образом в обработчике событий мыши
      break;
    case 'text':
      // Для текста не нужно обновление
      break;
    case 'select':
      // Логика выбора элемента
      break;
  }
}

/**
 * Добавляет точку к многоточечной фигуре (многоугольник или кривая Безье)
 * @param {number} x - координата X
 * @param {number} y - координата Y
 */
function addPointToMultiPointShape(x, y) {
  // Применяем привязку к сетке, если она включена
  if (toolSettings.snapToGrid) {
    x = Math.round(x / toolSettings.gridSize) * toolSettings.gridSize;
    y = Math.round(y / toolSettings.gridSize) * toolSettings.gridSize;
  }
  
  if (!currentElement) {
    // Если текущего элемента нет, создаем новый
    currentElement = createDrawingElement(x, y);
  } else {
    // Добавляем новую точку к существующему элементу
    currentElement.points.push({ x, y });
  }
  
  // Перерисовываем canvas
  redrawCanvas();
}

/**
 * Выбирает элемент по координатам
 * @param {number} x - координата X
 * @param {number} y - координата Y
 * @returns {Object|null} - выбранный элемент или null, если ничего не выбрано
 */
function selectElementAt(x, y) {
  // Ищем элемент, содержащий точку (x, y)
  for (let i = drawingElements.length - 1; i >= 0; i--) {
    const element = drawingElements[i];
    
    // Проверяем, находится ли точка внутри элемента
    if (isPointInElement(x, y, element)) {
      return { index: i, element: element };
    }
  }
  
  return null;
}

/**
 * Проверяет, находится ли точка внутри элемента
 * @param {number} x - координата X
 * @param {number} y - координата Y
 * @param {Object} element - элемент для проверки
 * @returns {boolean} - true, если точка находится внутри элемента
 */
function isPointInElement(x, y, element) {
  const tolerance = element.lineWidth + 5;
  
  switch (element.type) {
    case 'freehand':
    case 'smoothFreehand':
      // Проверяем расстояние до каждого сегмента линии
      for (let i = 1; i < element.points.length; i++) {
        const p1 = element.points[i - 1];
        const p2 = element.points[i];
        
        if (distanceToLine(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance) {
          return true;
        }
      }
      return false;
      
    case 'line':
    case 'arrow':
      return distanceToLine(x, y, element.startX, element.startY, element.endX, element.endY) <= tolerance;
      
    case 'rectangle':
      // Проверяем, находится ли точка внутри прямоугольника или рядом с его границей
      const minX = Math.min(element.startX, element.endX);
      const maxX = Math.max(element.startX, element.endX);
      const minY = Math.min(element.startY, element.endY);
      const maxY = Math.max(element.startY, element.endY);
      
      if (element.fill !== 'transparent' && x >= minX && x <= maxX && y >= minY && y <= maxY) {
        return true; // Точка внутри прямоугольника с заливкой
      }
      
      // Проверяем близость к каждой стороне прямоугольника
      return (
        distanceToLine(x, y, minX, minY, maxX, minY) <= tolerance || // Верхняя сторона
        distanceToLine(x, y, maxX, minY, maxX, maxY) <= tolerance || // Правая сторона
        distanceToLine(x, y, maxX, maxY, minX, maxY) <= tolerance || // Нижняя сторона
        distanceToLine(x, y, minX, maxY, minX, minY) <= tolerance    // Левая сторона
      );
      
    case 'ellipse':
      const centerX = (element.startX + element.endX) / 2;
      const centerY = (element.startY + element.endY) / 2;
      const radiusX = Math.abs(element.endX - element.startX) / 2;
      const radiusY = Math.abs(element.endY - element.startY) / 2;
      
      // Нормализуем точку относительно центра и радиусов эллипса
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (element.fill !== 'transparent' && distance <= 1) {
        return true; // Точка внутри эллипса с заливкой
      }
      
      // Точка находится рядом с границей эллипса
      return Math.abs(distance - 1) * Math.min(radiusX, radiusY) <= tolerance;
      
    case 'polygon':
    case 'bezier':
      // Для многоугольника и кривой Безье проверка сложнее
      // Сначала проверяем, находится ли точка внутри многоугольника
      if (element.fill !== 'transparent' && isPointInPolygon(x, y, element.points)) {
        return true;
      }
      
      // Затем проверяем близость к каждой стороне
      for (let i = 1; i < element.points.length; i++) {
        const p1 = element.points[i - 1];
        const p2 = element.points[i];
        
        if (distanceToLine(x, y, p1.x, p1.y, p2.x, p2.y) <= tolerance) {
          return true;
        }
      }
      
      // Для замкнутого многоугольника проверяем также последнюю сторону
      if (element.type === 'polygon' && element.points.length > 2) {
        const first = element.points[0];
        const last = element.points[element.points.length - 1];
        
        if (distanceToLine(x, y, last.x, last.y, first.x, first.y) <= tolerance) {
          return true;
        }
      }
      
      return false;
      
    case 'text':
      // Для текста создаем прямоугольник, основанный на положении и размере текста
      const textWidth = element.text.length * element.fontSize * 0.6;
      const textHeight = element.fontSize * 1.2;
      
      return (
        x >= element.x && x <= element.x + textWidth &&
        y >= element.y - textHeight && y <= element.y
      );
      
    default:
      return false;
  }
}

/**
 * Рассчитывает расстояние от точки до отрезка
 * @param {number} x - координата X точки
 * @param {number} y - координата Y точки
 * @param {number} x1 - координата X начала отрезка
 * @param {number} y1 - координата Y начала отрезка
 * @param {number} x2 - координата X конца отрезка
 * @param {number} y2 - координата Y конца отрезка
 * @returns {number} - расстояние
 */
function distanceToLine(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Проверяет, находится ли точка внутри многоугольника
 * @param {number} x - координата X точки
 * @param {number} y - координата Y точки
 * @param {Array} points - массив точек многоугольника
 * @returns {boolean} - true, если точка внутри многоугольника
 */
function isPointInPolygon(x, y, points) {
  if (points.length < 3) return false;
  
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

// Экспортируем функции для использования в других файлах
window.drawingTools = {
  init: initDrawingTools,
  selectTool: selectTool,
  createElement: createDrawingElement,
  updateElement: updateDrawingElement,
  addPointToMultiPointShape: addPointToMultiPointShape,
  finishMultiPointShape: finishMultiPointShape,
  selectElementAt: selectElementAt
};
