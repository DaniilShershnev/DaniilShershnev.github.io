/**
 * drawing-canvas.js
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

// Параметры сглаживания линий
const smoothingFactor = 0.3; // Фактор сглаживания (от 0 до 1)
const minPointDistance = 5; // Минимальное расстояние между точками при рисовании
let lastSampledX = 0, lastSampledY = 0; // Последние выборочные точки

/**
 * Инициализирует canvas для рисования
 */
function initDrawingCanvas() {
  console.log('Инициализация canvas для рисования');
  
  // Получаем canvas и его контекст
  drawingCanvas = document.getElementById('drawing-canvas');
  
  if (!drawingCanvas) {
    console.error('Элемент drawing-canvas не найден');
    return;
  }
  
  // Делаем drawingCanvas глобально доступным
  window.drawingCanvas = drawingCanvas;
  
  drawingContext = drawingCanvas.getContext('2d');
  
  // Делаем drawingContext глобально доступным
  window.drawingContext = drawingContext;
  
  // Делаем drawingElements глобально доступным
  window.drawingElements = drawingElements;
  
  // Включаем сглаживание
  drawingContext.imageSmoothingEnabled = true;
  drawingContext.imageSmoothingQuality = 'high';
  
  // Устанавливаем размеры canvas
  resetCanvasSize();
  
  // Очищаем canvas
  clearDrawingCanvas();
  
  // Устанавливаем обработчики событий
  setupCanvasEvents();
  
  console.log('Canvas инициализирован успешно');
}

/**
 * Устанавливает размеры canvas в соответствии с контейнером
 */
function resetCanvasSize() {
  const container = document.getElementById('drawing-canvas-container');
  if (!container || !drawingCanvas) {
    console.error('Контейнер или canvas не найдены');
    return;
  }
  
  // Получаем размеры контейнера
  const containerRect = container.getBoundingClientRect();
  
  console.log('Размеры контейнера:', containerRect.width, 'x', containerRect.height);
  
  // Устанавливаем размеры canvas
  drawingCanvas.width = containerRect.width;
  drawingCanvas.height = containerRect.height;
  
  console.log('Установлены размеры canvas:', drawingCanvas.width, 'x', drawingCanvas.height);
  
  // Перерисовываем canvas после изменения размеров
  redrawCanvas();
}

/**
 * Очищает canvas и сбрасывает все элементы
 */
function clearDrawingCanvas() {
  if (!drawingContext) {
    console.error('Контекст canvas не инициализирован');
    return;
  }
  
  console.log('Очистка canvas');
  
  // Очищаем canvas
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  
  // Сбрасываем массив элементов
  drawingElements = [];
  
  // Обновляем глобальную переменную
  window.drawingElements = drawingElements;
  
  // Перерисовываем сетку и оси
  drawGrid();
  
  // Если есть функция истории, сохраняем состояние
  if (window.drawingHistory && typeof window.drawingHistory.saveState === 'function') {
    window.drawingHistory.saveState(drawingElements);
  }
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
  console.log('Настройка обработчиков событий для canvas');
  
  if (!drawingCanvas) {
    console.error('Canvas не инициализирован');
    return;
  }
  
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
  
  // Добавляем обработчик изменения размера окна
  window.addEventListener('resize', function() {
    resetCanvasSize();
  });
  
  console.log('Обработчики событий для canvas настроены');
}

/**
 * Начинает процесс рисования
 * @param {Event} e - событие мыши
 */
function startDrawing(e) {
  console.log('Начало рисования');
  isDrawing = true;
  
  // Получаем координаты
  const rect = drawingCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  console.log('Начальные координаты:', lastX, lastY);
  
  // Сбрасываем последние выборочные точки
  lastSampledX = lastX;
  lastSampledY = lastY;
  
  // Создаем новый элемент в зависимости от текущего инструмента
  if (typeof window.drawingTools?.createElement === 'function') {
    currentElement = window.drawingTools.createElement(lastX, lastY);
  } else if (typeof createDrawingElement === 'function') {
    currentElement = createDrawingElement(lastX, lastY);
  } else {
    console.error('Функция createDrawingElement не найдена');
    return;
  }
  
  console.log('Создан новый элемент:', currentElement);
  
  // Если используется инструмент свободного рисования, добавляем первую точку
  if (currentElement && currentElement.type === 'freehand') {
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
  
  // Рассчитываем расстояние от последней выборочной точки
  const dx = currentX - lastSampledX;
  const dy = currentY - lastSampledY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Обновляем элемент только если прошли минимальное расстояние
  if (distance >= minPointDistance) {
    // Обновляем элемент в зависимости от текущего инструмента
    if (typeof window.drawingTools?.updateElement === 'function') {
      window.drawingTools.updateElement(currentElement, currentX, currentY);
    } else if (typeof updateDrawingElement === 'function') {
      updateDrawingElement(currentElement, currentX, currentY);
    } else {
      console.error('Функция updateDrawingElement не найдена');
    }
    
    // Обновляем последние выборочные точки
    lastSampledX = currentX;
    lastSampledY = currentY;
    
    // Перерисовываем все
    redrawCanvas();
  }
  
  // Обновляем последние координаты для следующего события
  lastX = currentX;
  lastY = currentY;
}

/**
 * Завершает процесс рисования
 */
function stopDrawing() {
  if (!isDrawing) return;
  
  console.log('Завершение рисования');
  
  // Добавляем элемент в список
  if (currentElement) {
    // Для свободного рисования применяем сглаживание
    if (currentElement.type === 'freehand' && currentElement.points.length > 2) {
      currentElement.points = smoothPath(currentElement.points);
    }
    
    drawingElements.push(currentElement);
    
    // Обновляем глобальную переменную
    window.drawingElements = drawingElements;
    
    console.log('Элемент добавлен в список');
    console.log('Всего элементов:', drawingElements.length);
    
    currentElement = null;
    
    // Если есть функция истории, сохраняем состояние
    if (window.drawingHistory && typeof window.drawingHistory.saveState === 'function') {
      window.drawingHistory.saveState(drawingElements);
    }
  }
  
  isDrawing = false;
  
  // Перерисовываем canvas
  redrawCanvas();
}

/**
 * Сглаживает путь с помощью алгоритма сглаживания
 * @param {Array} points - массив точек пути
 * @returns {Array} - сглаженный массив точек
 */
function smoothPath(points) {
  if (points.length <= 2) return points;
  
  const smoothed = [points[0]];
  
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    
    // Вычисляем средние координаты
    const smoothX = current.x + (next.x - prev.x) * smoothingFactor;
    const smoothY = current.y + (next.y - prev.y) * smoothingFactor;
    
    smoothed.push({ x: smoothX, y: smoothY });
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
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
    drawingCanvas.setPointerCapture(e.pointerId);
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
    drawingCanvas.releasePointerCapture(e.pointerId);
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
  if (!drawingContext) {
    console.error('Контекст canvas не инициализирован');
    return;
  }
  
  // Очищаем canvas
  drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  
  // Рисуем сетку
  drawGrid();
  
  // Проверяем доступность функции drawElement
  let drawFunc;
  if (typeof window.drawElement === 'function') {
    drawFunc = window.drawElement;
  } else if (typeof window.drawingTools?.drawElement === 'function') {
    drawFunc = window.drawingTools.drawElement;
  } else {
    console.error('Функция drawElement не найдена');
    return;
  }
  
  // Рисуем все элементы
  if (drawingElements && drawingElements.length > 0) {
    drawingElements.forEach(element => {
      drawFunc(element);
    });
  }
  
  // Рисуем текущий элемент, если он есть
  if (currentElement) {
    drawFunc(currentElement);
  }
}

/**
 * Устанавливает полноэкранный режим для canvas
 * @param {boolean} fullscreen - флаг полноэкранного режима
 */
function setFullscreenMode(fullscreen) {
  const container = document.getElementById('drawing-canvas-container');
  const modal = document.querySelector('.drawing-modal-content');
  
  if (fullscreen) {
    // Сохраняем старые размеры для возврата
    container.dataset.originalWidth = container.style.width || '';
    container.dataset.originalHeight = container.style.height || '';
    modal.dataset.originalWidth = modal.style.width || '';
    modal.dataset.originalHeight = modal.style.height || '';
    
    // Устанавливаем полноэкранный режим
    modal.style.width = '95vw';
    modal.style.height = '90vh';
    modal.style.maxWidth = '100%';
    modal.style.maxHeight = '100%';
    container.style.width = '100%';
    container.style.height = 'calc(100% - 120px)'; // Учитываем высоту панели инструментов
  } else {
    // Восстанавливаем исходные размеры
    modal.style.width = modal.dataset.originalWidth || '80%';
    modal.style.height = modal.dataset.originalHeight || '80vh';
    modal.style.maxWidth = '900px';
    modal.style.maxHeight = '700px';
    container.style.width = container.dataset.originalWidth || '';
    container.style.height = container.dataset.originalHeight || '';
  }
  
  // Обновляем размеры canvas и перерисовываем
  resetCanvasSize();
}

// Экспортируем функции для использования в других файлах
window.drawingCanvas = {
  init: initDrawingCanvas,
  clear: clearDrawingCanvas,
  redraw: redrawCanvas,
  setFullscreenMode: setFullscreenMode
};

// Делаем функцию redrawCanvas доступной глобально
window.redrawCanvas = redrawCanvas;
