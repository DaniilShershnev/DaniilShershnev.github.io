/**
 * Модуль Canvas для редактора рисования
 * Отвечает за работу с Canvas и базовыми функциями рисования
 */

// Переменные для работы с canvas
let drawingCanvas, drawingContext;
let isDrawing = false;
let lastX = 0, lastY = 0;

// Массив для хранения всех нарисованных элементов
let drawingElements = [];

// Текущий элемент, который рисуется
let currentElement = null;

/**
 * Инициализирует canvas для рисования
 */
function initDrawingCanvas() {
  // Получаем canvas и его контекст
  drawingCanvas = document.getElementById('drawing-canvas');
  drawingContext = drawingCanvas.getContext('2d');
  
  // Устанавливаем размеры canvas
  resetCanvasSize();
  
  // Очищаем canvas
  clearDrawingCanvas();
  
  // Устанавливаем обработчики событий
  setupCanvasEvents();
}

/**
 * Устанавливает размеры canvas в соответствии с контейнером
 */
function resetCanvasSize() {
  const container = document.getElementById('drawing-canvas-container');
  drawingCanvas.width = container.clientWidth;
  drawingCanvas.height = container.clientHeight;
}

/**
 * Очищает canvas и сбрасывает все элементы
 */
function clearDrawingCanvas() {
  if (!drawingContext) return;
  
  // Очищаем canvas
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  
  // Сбрасываем массив элементов
  drawingElements = [];
  
  // Перерисовываем сетку и оси (опционально)
  drawGrid();
}

/**
 * Рисует сетку на canvas для удобства
 */
function drawGrid() {
  if (!drawingContext) return;
  
  const width = drawingCanvas.width;
  const height = drawingCanvas.height;
  const gridSize = 20;
  
  drawingContext.save();
  
  // Рисуем сетку светло-серым цветом
  drawingContext.strokeStyle = '#e0e0e0';
  drawingContext.lineWidth = 0.5;
  
  // Вертикальные линии
  for (let x = 0; x <= width; x += gridSize) {
    drawingContext.beginPath();
    drawingContext.moveTo(x, 0);
    drawingContext.lineTo(x, height);
    drawingContext.stroke();
  }
  
  // Горизонтальные линии
  for (let y = 0; y <= height; y += gridSize) {
    drawingContext.beginPath();
    drawingContext.moveTo(0, y);
    drawingContext.lineTo(width, y);
    drawingContext.stroke();
  }
  
  // Рисуем оси координат
  drawingContext.strokeStyle = '#a0a0a0';
  drawingContext.lineWidth = 1;
  
  // Ось X
  drawingContext.beginPath();
  drawingContext.moveTo(0, height / 2);
  drawingContext.lineTo(width, height / 2);
  drawingContext.stroke();
  
  // Ось Y
  drawingContext.beginPath();
  drawingContext.moveTo(width / 2, 0);
  drawingContext.lineTo(width / 2, height);
  drawingContext.stroke();
  
  drawingContext.restore();
}

/**
 * Устанавливает обработчики событий для canvas
 */
function setupCanvasEvents() {
  // События мыши для desktop
  drawingCanvas.addEventListener('mousedown', startDrawing);
  drawingCanvas.addEventListener('mousemove', draw);
  drawingCanvas.addEventListener('mouseup', stopDrawing);
  drawingCanvas.addEventListener('mouseout', stopDrawing);
  
  // События касания для mobile/tablet
  drawingCanvas.addEventListener('touchstart', handleTouchStart);
  drawingCanvas.addEventListener('touchmove', handleTouchMove);
  drawingCanvas.addEventListener('touchend', handleTouchEnd);
  
  // Поддержка стилуса (если доступно)
  if (window.PointerEvent) {
    drawingCanvas.addEventListener('pointerdown', handlePointerDown);
    drawingCanvas.addEventListener('pointermove', handlePointerMove);
    drawingCanvas.addEventListener('pointerup', handlePointerUp);
    drawingCanvas.addEventListener('pointerout', handlePointerUp);
  }
}

/**
 * Начинает процесс рисования
 * @param {Event} e - событие мыши
 */
function startDrawing(e) {
  isDrawing = true;
  
  // Получаем координаты
  const rect = drawingCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  // Создаем новый элемент в зависимости от текущего инструмента
  currentElement = createDrawingElement(lastX, lastY);
  
  // Если используется инструмент свободного рисования, добавляем первую точку
  if (currentTool === 'freehand') {
    currentElement.points.push({ x: lastX, y: lastY });
  }
}

/**
 * Продолжает процесс рисования
 * @param {Event} e - событие мыши
 */
function draw(e) {
  if (!isDrawing) return;
  
  // Получаем текущие координаты
  const rect = drawingCanvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  // Обновляем элемент в зависимости от текущего инструмента
  updateDrawingElement(currentElement, currentX, currentY);
  
  // Перерисовываем все
  redrawCanvas();
  
  // Обновляем последние координаты
  lastX = currentX;
  lastY = currentY;
}

/**
 * Завершает процесс рисования
 */
function stopDrawing() {
  if (!isDrawing) return;
  
  // Добавляем элемент в список
  if (currentElement) {
    drawingElements.push(currentElement);
    currentElement = null;
  }
  
  isDrawing = false;
}

/**
 * Обработчик для событий касания (начало)
 * @param {TouchEvent} e - событие касания
 */
function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  drawingCanvas.dispatchEvent(mouseEvent);
}

/**
 * Обработчик для событий касания (движение)
 * @param {TouchEvent} e - событие касания
 */
function handleTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  drawingCanvas.dispatchEvent(mouseEvent);
}

/**
 * Обработчик для событий касания (окончание)
 * @param {TouchEvent} e - событие касания
 */
function handleTouchEnd(e) {
  e.preventDefault();
  const mouseEvent = new MouseEvent('mouseup', {});
  drawingCanvas.dispatchEvent(mouseEvent);
}

/**
 * Обработчик для событий стилуса (начало)
 * @param {PointerEvent} e - событие стилуса
 */
function handlePointerDown(e) {
  if (e.pointerType === 'pen' || e.pointerType === 'touch') {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: e.clientX,
      clientY: e.clientY
    });
    drawingCanvas.dispatchEvent(mouseEvent);
    
    // Сохраняем давление стилуса если оно доступно
    if (e.pressure > 0) {
      currentPressure = e.pressure;
    }
  }
}

/**
 * Обработчик для событий стилуса (движение)
 * @param {PointerEvent} e - событие стилуса
 */
function handlePointerMove(e) {
  if (e.pointerType === 'pen' || e.pointerType === 'touch') {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: e.clientX,
      clientY: e.clientY
    });
    drawingCanvas.dispatchEvent(mouseEvent);
    
    // Обновляем давление стилуса
    if (e.pressure > 0) {
      currentPressure = e.pressure;
    }
  }
}

/**
 * Обработчик для событий стилуса (окончание)
 * @param {PointerEvent} e - событие стилуса
 */
function handlePointerUp(e) {
  if (e.pointerType === 'pen' || e.pointerType === 'touch') {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    drawingCanvas.dispatchEvent(mouseEvent);
    
    // Сбрасываем давление
    currentPressure = 1.0;
  }
}

/**
 * Перерисовывает весь canvas
 */
function redrawCanvas() {
  if (!drawingContext) return;
  
  // Очищаем canvas
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  
  // Рисуем сетку
  drawGrid();
  
  // Рисуем все элементы
  drawingElements.forEach(element => {
    drawElement(element);
  });
  
  // Рисуем текущий элемент, если он есть
  if (currentElement) {
    drawElement(currentElement);
  }
}

/**
 * Рисует отдельный элемент на canvas
 * @param {Object} element - элемент для рисования
 */
function drawElement(element) {
  if (!drawingContext) return;
  
  drawingContext.save();
  
  // Устанавливаем стиль в соответствии с элементом
  drawingContext.strokeStyle = element.color;
  drawingContext.lineWidth = element.lineWidth;
  drawingContext.fillStyle = element.fill || 'transparent';
  
  switch (element.type) {
    case 'freehand':
      drawFreehand(element);
      break;
    case 'line':
      drawLine(element);
      break;
    case 'rectangle':
      drawRectangle(element);
      break;
    case 'ellipse':
      drawEllipse(element);
      break;
    case 'text':
      drawText(element);
      break;
    case 'arrow':
      drawArrow(element);
      break;
  }
  
  drawingContext.restore();
}

/**
 * Рисует линию свободной формы
 * @param {Object} element - элемент для рисования
 */
function drawFreehand(element) {
  if (!element.points || element.points.length < 2) return;
  
  drawingContext.beginPath();
  drawingContext.moveTo(element.points[0].x, element.points[0].y);
  
  for (let i = 1; i < element.points.length; i++) {
    drawingContext.lineTo(element.points[i].x, element.points[i].y);
  }
  
  drawingContext.stroke();
}

/**
 * Рисует прямую линию
 * @param {Object} element - элемент для рисования
 */
function drawLine(element) {
  drawingContext.beginPath();
  drawingContext.moveTo(element.startX, element.startY);
  drawingContext.lineTo(element.endX, element.endY);
  drawingContext.stroke();
}

/**
 * Рисует прямоугольник
 * @param {Object} element - элемент для рисования
 */
function drawRectangle(element) {
  const width = element.endX - element.startX;
  const height = element.endY - element.startY;
  
  if (element.fill !== 'transparent') {
    drawingContext.fillRect(element.startX, element.startY, width, height);
  }
  
  drawingContext.strokeRect(element.startX, element.startY, width, height);
}

/**
 * Рисует эллипс
 * @param {Object} element - элемент для рисования
 */
function drawEllipse(element) {
  const centerX = (element.startX + element.endX) / 2;
  const centerY = (element.startY + element.endY) / 2;
  const radiusX = Math.abs(element.endX - element.startX) / 2;
  const radiusY = Math.abs(element.endY - element.startY) / 2;
  
  drawingContext.beginPath();
  drawingContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  
  if (element.fill !== 'transparent') {
    drawingContext.fill();
  }
  
  drawingContext.stroke();
}

/**
 * Рисует текст
 * @param {Object} element - элемент для рисования
 */
function drawText(element) {
  drawingContext.font = `${element.fontSize}px ${element.fontFamily}`;
  drawingContext.fillStyle = element.color;
  drawingContext.fillText(element.text, element.x, element.y);
}

/**
 * Рисует стрелку
 * @param {Object} element - элемент для рисования
 */
function drawArrow(element) {
  // Рисуем линию
  drawingContext.beginPath();
  drawingContext.moveTo(element.startX, element.startY);
  drawingContext.lineTo(element.endX, element.endY);
  drawingContext.stroke();
  
  // Вычисляем угол для наконечника стрелки
  const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX);
  const headLength = 15; // Длина наконечника стрелки
  
  // Рисуем наконечник стрелки
  drawingContext.beginPath();
  drawingContext.moveTo(element.endX, element.endY);
  drawingContext.lineTo(
    element.endX - headLength * Math.cos(angle - Math.PI / 6),
    element.endY - headLength * Math.sin(angle - Math.PI / 6)
  );
  drawingContext.lineTo(
    element.endX - headLength * Math.cos(angle + Math.PI / 6),
    element.endY - headLength * Math.sin(angle + Math.PI / 6)
  );
  drawingContext.closePath();
  drawingContext.fill();
}
