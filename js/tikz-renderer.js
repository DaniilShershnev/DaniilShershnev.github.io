/**
 * tikz-renderer.js
 * Отвечает за рендеринг TikZ-рисунков в предпросмотре
 */

/**
 * Рендерит TikZ-код на канве
 * @param {string} tikzCode - TikZ-код рисунка
 * @param {string} canvasId - ID канвы для рендеринга
 */
function renderTikzToCanvas(tikzCode, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Включаем сглаживание
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Очищаем канву
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Устанавливаем белый фон
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Анализируем TikZ-код для определения границ
  const bounds = calculateTikzBounds(tikzCode);
  
  // Настраиваем масштаб и смещение
  const padding = 20;
  const scale = Math.min(
    (canvas.width - padding * 2) / (bounds.maxX - bounds.minX || 1),
    (canvas.height - padding * 2) / (bounds.maxY - bounds.minY || 1)
  );
  
  // Рассчитываем смещение для центрирования
  const offsetX = (canvas.width / 2) - ((bounds.maxX + bounds.minX) / 2) * scale;
  const offsetY = (canvas.height / 2) + ((bounds.maxY + bounds.minY) / 2) * scale;
  
  // Применяем трансформацию
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, -scale); // Инвертируем ось Y, так как в TikZ она направлена вверх
  
  // Рисуем каждую команду
  drawTikzCommands(ctx, tikzCode);
  
  ctx.restore();
}

/**
 * Рассчитывает границы TikZ-рисунка
 * @param {string} tikzCode - TikZ-код рисунка
 * @returns {Object} - объект с границами рисунка
 */
function calculateTikzBounds(tikzCode) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  // Извлекаем все координаты из TikZ-кода
  const coordsRegex = /\((-?[\d\.]+),\s*(-?[\d\.]+)\)/g;
  let match;
  
  while ((match = coordsRegex.exec(tikzCode)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  
  // Если координаты не найдены, используем значения по умолчанию
  if (minX === Infinity) {
    return { minX: -5, minY: -5, maxX: 5, maxY: 5 };
  }
  
  // Добавляем отступ для более приятного отображения
  const padding = Math.max(
    (maxX - minX) * 0.1,
    (maxY - minY) * 0.1,
    0.5
  );
  
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding
  };
}

/**
 * Рисует TikZ-команды на канве
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} tikzCode - TikZ-код
 */
function drawTikzCommands(ctx, tikzCode) {
  // Извлекаем все команды \draw
  const drawCommands = tikzCode.match(/\\draw\[[^\]]*\][^;]+;/g) || [];
  
  drawCommands.forEach(command => {
    // Получаем атрибуты команды
    const attributes = command.match(/\\draw\[([^\]]*)\]/);
    const attributesStr = attributes ? attributes[1] : '';
    
    // Настраиваем стиль линии
    setLineStyle(ctx, attributesStr);
    
    // Обрабатываем каждый тип команды
    if (command.includes('ellipse')) {
      drawEllipse(ctx, command);
    } else if (command.includes('rectangle')) {
      drawRectangle(ctx, command);
    } else if (attributesStr.includes('->')) {
      drawArrow(ctx, command, attributesStr);
    } else if (command.includes(' -- ')) {
      drawPath(ctx, command);
    }
  });
}

/**
 * Устанавливает стиль линии на основе атрибутов TikZ
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} attributesStr - строка атрибутов
 */
function setLineStyle(ctx, attributesStr) {
  // Цвет
  let color = 'black';
  const colorMatch = attributesStr.match(/color=\{rgb,255:red,(\d+);green,(\d+);blue,(\d+)\}/);
  if (colorMatch) {
    color = `rgb(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]})`;
  }
  
  // Толщина линии
  let lineWidth = 2;
  const lineWidthMatch = attributesStr.match(/line width=([\d\.]+)pt/);
  if (lineWidthMatch) {
    lineWidth = parseFloat(lineWidthMatch[1]) / 10;
  }
  
  // Применяем стиль
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

/**
 * Рисует эллипс
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} command - TikZ-команда
 */
function drawEllipse(ctx, command) {
  const ellipseMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*ellipse\s*\((-?[\d\.]+)\s*and\s*(-?[\d\.]+)\)/);
  if (ellipseMatch) {
    const centerX = parseFloat(ellipseMatch[1]);
    const centerY = parseFloat(ellipseMatch[2]);
    const radiusX = parseFloat(ellipseMatch[3]);
    const radiusY = parseFloat(ellipseMatch[4]);
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/**
 * Рисует прямоугольник
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} command - TikZ-команда
 */
function drawRectangle(ctx, command) {
  const rectMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*rectangle\s*\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
  if (rectMatch) {
    const x1 = parseFloat(rectMatch[1]);
    const y1 = parseFloat(rectMatch[2]);
    const x2 = parseFloat(rectMatch[3]);
    const y2 = parseFloat(rectMatch[4]);
    
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  }
}

/**
 * Рисует стрелку
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} command - TikZ-команда
 * @param {string} attributesStr - строка атрибутов
 */
function drawArrow(ctx, command, attributesStr) {
  const lineMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*--\s*\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
  if (lineMatch) {
    const x1 = parseFloat(lineMatch[1]);
    const y1 = parseFloat(lineMatch[2]);
    const x2 = parseFloat(lineMatch[3]);
    const y2 = parseFloat(lineMatch[4]);
    
    // Рисуем линию
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Рисуем наконечник стрелки
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLength = ctx.lineWidth * 5;
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Рисует путь (линию или ломаную)
 * @param {CanvasRenderingContext2D} ctx - контекст канвы
 * @param {string} command - TikZ-команда
 */
function drawPath(ctx, command) {
  // Ищем все точки в команде
  const points = [];
  const pointRegex = /\((-?[\d\.]+),\s*(-?[\d\.]+)\)/g;
  let pointMatch;
  
  while ((pointMatch = pointRegex.exec(command)) !== null) {
    points.push({
      x: parseFloat(pointMatch[1]),
      y: parseFloat(pointMatch[2])
    });
  }
  
  if (points.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  }
}

// Экспортируем функции для использования в других файлах
window.tikzRenderer = {
  renderTikzToCanvas,
  calculateTikzBounds
};
