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
 * Рисует элемент на холсте
 * @param {Object} element - элемент для рисования
 */
function drawElement(element) {
  if (!drawingContext) return;
  
  // Сохраняем текущие настройки контекста
  drawingContext.save();
  
  // Устанавливаем общие параметры
  drawingContext.strokeStyle = element.color;
  drawingContext.lineWidth = element.lineWidth;
  drawingContext.lineJoin = 'round';
  drawingContext.lineCap = 'round';
  
  // Рисуем в зависимости от типа элемента
  switch (element.type) {
    case 'freehand':
      drawFreehandElement(element);
      break;
    case 'smoothFreehand':
      drawSmoothFreehandElement(element);
      break;
    case 'line':
      drawLineElement(element);
      break;
    case 'rectangle':
      drawRectangleElement(element);
      break;
    case 'ellipse':
      drawEllipseElement(element);
      break;
    case 'arrow':
      drawArrowElement(element);
      break;
    case 'polygon':
      drawPolygonElement(element);
      break;
    case 'bezier':
      drawBezierElement(element);
      break;
    case 'text':
      drawTextElement(element);
      break;
  }
  
  // Восстанавливаем настройки контекста
  drawingContext.restore();
}

/**
 * Рисует элемент свободной формы
 * @param {Object} element - элемент для рисования
 */
function drawFreehandElement(element) {
  if (!element.points || element.points.length < 2) return;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.points[0].x, element.points[0].y);
  
  for (let i = 1; i < element.points.length; i++) {
    drawingContext.lineTo(element.points[i].x, element.points[i].y);
  }
  
  drawingContext.stroke();
}

/**
 * Рисует сглаженный элемент свободной формы
 * @param {Object} element - элемент для рисования
 */
function drawSmoothFreehandElement(element) {
  if (!element.points || element.points.length < 2) return;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.points[0].x, element.points[0].y);
  
  // Используем кривые Безье для сглаживания
  for (let i = 1; i < element.points.length - 1; i++) {
    const xc = (element.points[i].x + element.points[i + 1].x) / 2;
    const yc = (element.points[i].y + element.points[i + 1].y) / 2;
    drawingContext.quadraticCurveTo(element.points[i].x, element.points[i].y, xc, yc);
  }
  
  // Последняя точка
  if (element.points.length > 1) {
    const lastPoint = element.points[element.points.length - 1];
    drawingContext.lineTo(lastPoint.x, lastPoint.y);
  }
  
  drawingContext.stroke();
}

/**
 * Рисует линию
 * @param {Object} element - элемент для рисования
 */
function drawLineElement(element) {
  drawingContext.beginPath();
  drawingContext.moveTo(element.startX, element.startY);
  drawingContext.lineTo(element.endX, element.endY);
  drawingContext.stroke();
}

/**
 * Рисует прямоугольник
 * @param {Object} element - элемент для рисования
 */
function drawRectangleElement(element) {
  const x = Math.min(element.startX, element.endX);
  const y = Math.min(element.startY, element.endY);
  const width = Math.abs(element.endX - element.startX);
  const height = Math.abs(element.endY - element.startY);
  
  drawingContext.beginPath();
  drawingContext.rect(x, y, width, height);
  
  // Если есть заливка, то применяем её
  if (element.fill && element.fill !== 'transparent') {
    drawingContext.fillStyle = element.fill;
    drawingContext.fill();
  }
  
  drawingContext.stroke();
}

/**
 * Рисует эллипс
 * @param {Object} element - элемент для рисования
 */
function drawEllipseElement(element) {
  const centerX = (element.startX + element.endX) / 2;
  const centerY = (element.startY + element.endY) / 2;
  const radiusX = Math.abs(element.endX - element.startX) / 2;
  const radiusY = Math.abs(element.endY - element.startY) / 2;
  
  drawingContext.beginPath();
  drawingContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  
  // Если есть заливка, то применяем её
  if (element.fill && element.fill !== 'transparent') {
    drawingContext.fillStyle = element.fill;
    drawingContext.fill();
  }
  
  drawingContext.stroke();
}

/**
 * Рисует стрелку
 * @param {Object} element - элемент для рисования
 */
function drawArrowElement(element) {
  // Рисуем линию
  drawingContext.beginPath();
  drawingContext.moveTo(element.startX, element.startY);
  drawingContext.lineTo(element.endX, element.endY);
  drawingContext.stroke();
  
  // Рисуем наконечник стрелки
  const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX);
  const arrowSize = element.arrowSize || 10;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.endX, element.endY);
  drawingContext.lineTo(
    element.endX - arrowSize * Math.cos(angle - Math.PI / 6),
    element.endY - arrowSize * Math.sin(angle - Math.PI / 6)
  );
  drawingContext.lineTo(
    element.endX - arrowSize * Math.cos(angle + Math.PI / 6),
    element.endY - arrowSize * Math.sin(angle + Math.PI / 6)
  );
  drawingContext.closePath();
  drawingContext.fillStyle = element.color;
  drawingContext.fill();
}

/**
 * Рисует многоугольник
 * @param {Object} element - элемент для рисования
 */
function drawPolygonElement(element) {
  if (!element.points || element.points.length < 2) return;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.points[0].x, element.points[0].y);
  
  for (let i = 1; i < element.points.length; i++) {
    drawingContext.lineTo(element.points[i].x, element.points[i].y);
  }
  
  // Замыкаем многоугольник
  drawingContext.closePath();
  
  // Если есть заливка, то применяем её
  if (element.fill && element.fill !== 'transparent') {
    drawingContext.fillStyle = element.fill;
    drawingContext.fill();
  }
  
  drawingContext.stroke();
}

/**
 * Рисует кривую Безье
 * @param {Object} element - элемент для рисования
 */
function drawBezierElement(element) {
  if (!element.points || element.points.length < 2) return;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.points[0].x, element.points[0].y);
  
  if (element.points.length === 2) {
    // Если только 2 точки, рисуем линию
    drawingContext.lineTo(element.points[1].x, element.points[1].y);
  } else if (element.points.length === 3) {
    // Если 3 точки, рисуем квадратичную кривую Безье
    drawingContext.quadraticCurveTo(
      element.points[1].x, element.points[1].y,
      element.points[2].x, element.points[2].y
    );
  } else if (element.points.length === 4) {
    // Если 4 точки, рисуем кубическую кривую Безье
    drawingContext.bezierCurveTo(
      element.points[1].x, element.points[1].y,
      element.points[2].x, element.points[2].y,
      element.points[3].x, element.points[3].y
    );
  } else {
    // Для более сложных кривых используем составные кривые Безье
    for (let i = 1; i < element.points.length - 2; i += 3) {
      drawingContext.bezierCurveTo(
        element.points[i].x, element.points[i].y,
        element.points[i + 1].x, element.points[i + 1].y,
        element.points[i + 2].x, element.points[i + 2].y
      );
    }
    
    // Обрабатываем оставшиеся точки
    const remaining = (element.points.length - 1) % 3;
    if (remaining === 1) {
      drawingContext.lineTo(element.points[element.points.length - 1].x, element.points[element.points.length - 1].y);
    } else if (remaining === 2) {
      drawingContext.quadraticCurveTo(
        element.points[element.points.length - 2].x, element.points[element.points.length - 2].y,
        element.points[element.points.length - 1].x, element.points[element.points.length - 1].y
      );
    }
  }
  
  drawingContext.stroke();
}

/**
 * Рисует текст
 * @param {Object} element - элемент для рисования
 */
function drawTextElement(element) {
  drawingContext.font = `${element.fontSize}px ${element.fontFamily || 'Arial'}`;
  drawingContext.fillStyle = element.color;
  drawingContext.fillText(element.text, element.x, element.y);
}

/**
 * Добавляет точку к многоточечной фигуре (многоугольник или кривая Безье)
 * @param {number} x - координата X
 * @param {number} y - координата Y
 */
