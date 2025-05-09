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
  
  // Рисуем все элементы напрямую, без вызова внешних функций
  drawingElements.forEach(element => {
    // Сохраняем настройки контекста
    drawingContext.save();
    
    // Устанавливаем параметры для рисования
    drawingContext.strokeStyle = element.color || '#000000';
    drawingContext.lineWidth = element.lineWidth || 2;
    drawingContext.lineJoin = 'round';
    drawingContext.lineCap = 'round';
    
    // Рисуем элемент в зависимости от типа
    if (element.type === 'freehand' && element.points && element.points.length) {
      drawingContext.beginPath();
      drawingContext.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        drawingContext.lineTo(element.points[i].x, element.points[i].y);
      }
      drawingContext.stroke();
    } else if (element.type === 'line') {
      drawingContext.beginPath();
      drawingContext.moveTo(element.startX, element.startY);
      drawingContext.lineTo(element.endX, element.endY);
      drawingContext.stroke();
    } else if (element.type === 'rectangle') {
      const x = Math.min(element.startX, element.endX);
      const y = Math.min(element.startY, element.endY);
      const width = Math.abs(element.endX - element.startX);
      const height = Math.abs(element.endY - element.startY);
      
      drawingContext.beginPath();
      drawingContext.rect(x, y, width, height);
      
      if (element.fill && element.fill !== 'transparent') {
        drawingContext.fillStyle = element.fill;
        drawingContext.fill();
      }
      
      drawingContext.stroke();
    } else if (element.type === 'ellipse') {
      const centerX = (element.startX + element.endX) / 2;
      const centerY = (element.startY + element.endY) / 2;
      const radiusX = Math.abs(element.endX - element.startX) / 2;
      const radiusY = Math.abs(element.endY - element.startY) / 2;
      
      drawingContext.beginPath();
      drawingContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      
      if (element.fill && element.fill !== 'transparent') {
        drawingContext.fillStyle = element.fill;
        drawingContext.fill();
      }
      
      drawingContext.stroke();
    }
    
    // Восстанавливаем настройки контекста
    drawingContext.restore();
  });
  
  // Рисуем текущий элемент, если он есть
  if (currentElement) {
    // Повторяем то же самое для текущего элемента
    drawingContext.save();
    
    drawingContext.strokeStyle = currentElement.color || '#000000';
    drawingContext.lineWidth = currentElement.lineWidth || 2;
    drawingContext.lineJoin = 'round';
    drawingContext.lineCap = 'round';
    
    if (currentElement.type === 'freehand' && currentElement.points && currentElement.points.length) {
      drawingContext.beginPath();
      drawingContext.moveTo(currentElement.points[0].x, currentElement.points[0].y);
      for (let i = 1; i < currentElement.points.length; i++) {
        drawingContext.lineTo(currentElement.points[i].x, currentElement.points[i].y);
      }
      drawingContext.stroke();
    } else if (currentElement.type === 'line') {
      drawingContext.beginPath();
      drawingContext.moveTo(currentElement.startX, currentElement.startY);
      drawingContext.lineTo(currentElement.endX, currentElement.endY);
      drawingContext.stroke();
    } else if (currentElement.type === 'rectangle') {
      const x = Math.min(currentElement.startX, currentElement.endX);
      const y = Math.min(currentElement.startY, currentElement.endY);
      const width = Math.abs(currentElement.endX - currentElement.startX);
      const height = Math.abs(currentElement.endY - currentElement.startY);
      
      drawingContext.beginPath();
      drawingContext.rect(x, y, width, height);
      
      if (currentElement.fill && currentElement.fill !== 'transparent') {
        drawingContext.fillStyle = currentElement.fill;
        drawingContext.fill();
      }
      
      drawingContext.stroke();
    } else if (currentElement.type === 'ellipse') {
      const centerX = (currentElement.startX + currentElement.endX) / 2;
      const centerY = (currentElement.startY + currentElement.endY) / 2;
      const radiusX = Math.abs(currentElement.endX - currentElement.startX) / 2;
      const radiusY = Math.abs(currentElement.endY - currentElement.startY) / 2;
      
      drawingContext.beginPath();
      drawingContext.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      
      if (currentElement.fill && currentElement.fill !== 'transparent') {
        drawingContext.fillStyle = currentElement.fill;
        drawingContext.fill();
      }
      
      drawingContext.stroke();
    }
    
    drawingContext.restore();
  }
}

/**
 * Устанавливает полноэкранный режим для canvas
 * @param {boolean} fullscreen - флаг полноэкранного режима
 */
function setFullscreenMode(fullscreen) {
  const container = document.getElementById('drawing-canvas-container');
  const modal = document.querySelector('.drawing-modal-content');
  
  if (!container || !modal) {
    console.error('Элементы для полноэкранного режима не найдены');
    return;
  }
  
  if (fullscreen) {
    // Вместо прямого изменения стилей используем CSS-класс
    modal.classList.add('fullscreen');
    
    // Обновляем текст кнопки, если она существует
    const fullscreenBtn = document.getElementById('drawing-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5,14H7V19H12V17H7V14M7,10V5H12V3H5V10H7M17,17H12V19H19V12H17V17M12,7H17V12H19V5H12V7Z" />
        </svg>
        Свернуть
      `;
    }
  } else {
    // Удаляем класс полноэкранного режима
    modal.classList.remove('fullscreen');
    
    // Обновляем текст кнопки, если она существует
    const fullscreenBtn = document.getElementById('drawing-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" />
        </svg>
        Развернуть
      `;
    }
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
