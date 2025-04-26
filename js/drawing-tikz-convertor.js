/**
 * Модуль конвертации рисунка в TikZ код
 * Отвечает за преобразование нарисованных элементов в код TikZ для LaTeX
 */

/**
 * Преобразует все элементы рисунка в TikZ код
 * @returns {string} - сгенерированный TikZ код
 */
function convertToTikZ() {
  if (!drawingElements || drawingElements.length === 0) {
    return '% Пустой рисунок';
  }
  
  // Создаем массив для хранения строк TikZ кода
  const tikzCode = [];
  
  // Масштабируем координаты
  const scale = calculateTikZScale();
  
  // Начинаем с преамбулы
  tikzCode.push('% Рисунок создан в редакторе LaTeX');
  tikzCode.push('% Дата: ' + new Date().toLocaleDateString());
  tikzCode.push('');
  
  // Преобразуем каждый элемент в TikZ код
  drawingElements.forEach(element => {
    const elementCode = convertElementToTikZ(element, scale);
    if (elementCode) {
      tikzCode.push(elementCode);
    }
  });
  
  // Возвращаем объединенный код
  return tikzCode.join('\n');
}

/**
 * Рассчитывает масштаб для TikZ
 * @returns {Object} - объект с параметрами масштабирования
 */
function calculateTikZScale() {
  // Получаем размеры canvas
  const width = drawingCanvas.width;
  const height = drawingCanvas.height;
  
  // Находим минимальные и максимальные координаты всех элементов
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  
  drawingElements.forEach(element => {
    switch (element.type) {
      case 'freehand':
        element.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
        break;
        
      case 'line':
      case 'rectangle':
      case 'ellipse':
      case 'arrow':
        minX = Math.min(minX, element.startX, element.endX);
        minY = Math.min(minY, element.startY, element.endY);
        maxX = Math.max(maxX, element.startX, element.endX);
        maxY = Math.max(maxY, element.startY, element.endY);
        break;
        
      case 'text':
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x + element.text.length * element.fontSize * 0.6);
        maxY = Math.max(maxY, element.y + element.fontSize);
        break;
    }
  });
  
  // Добавляем отступы
  minX = Math.max(0, minX - 10);
  minY = Math.max(0, minY - 10);
  maxX = Math.min(width, maxX + 10);
  maxY = Math.min(height, maxY + 10);
  
  // Вычисляем центр
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Вычисляем масштаб (обычно TikZ использует единицы cm)
  const tikzWidth = 10; // в сантиметрах
  const scaleX = tikzWidth / (maxX - minX);
  const scaleY = scaleX; // Сохраняем соотношение сторон
  
  return {
    minX,
    minY,
    centerX,
    centerY,
    scaleX,
    scaleY
  };
}

/**
 * Преобразует координату X из canvas в TikZ
 * @param {number} x - координата X в canvas
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {number} - координата X в TikZ
 */
function convertX(x, scale) {
  return ((x - scale.centerX) * scale.scaleX).toFixed(2);
}

/**
 * Преобразует координату Y из canvas в TikZ
 * @param {number} y - координата Y в canvas
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {number} - координата Y в TikZ
 */
function convertY(y, scale) {
  // В TikZ ось Y направлена вверх, а в canvas - вниз
  return (-(y - scale.centerY) * scale.scaleY).toFixed(2);
}

/**
 * Преобразует цвет в формат TikZ
 * @param {string} color - цвет в формате #RRGGBB
 * @returns {string} - цвет в формате TikZ
 */
function convertColor(color) {
  // Если цвет в формате #RRGGBB, преобразуем его в rgb
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return `{rgb,255:red,${Math.round(r * 255)};green,${Math.round(g * 255)};blue,${Math.round(b * 255)}}`;
  }
  
  // Для именованных цветов (например, 'red', 'blue')
  return color;
}

/**
 * Преобразует отдельный элемент в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertElementToTikZ(element, scale) {
  switch (element.type) {
    case 'freehand':
      return convertFreehandToTikZ(element, scale);
    case 'line':
      return convertLineToTikZ(element, scale);
    case 'rectangle':
      return convertRectangleToTikZ(element, scale);
    case 'ellipse':
      return convertEllipseToTikZ(element, scale);
    case 'text':
      return convertTextToTikZ(element, scale);
    case 'arrow':
      return convertArrowToTikZ(element, scale);
    default:
      return null;
  }
}

/**
 * Преобразует линию свободной формы в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertFreehandToTikZ(element, scale) {
  if (!element.points || element.points.length < 2) return null;
  
  // Начинаем путь
  let path = `\\draw[color=${convertColor(element.color)}, line width=${element.lineWidth}pt] `;
  
  // Добавляем точки
  const points = element.points.map((point, index) => {
    const x = convertX(point.x, scale);
    const y = convertY(point.y, scale);
    
    if (index === 0) {
      return `(${x}, ${y})`;
    } else {
      return ` -- (${x}, ${y})`;
    }
  }).join('');
  
  path += points + ';';
  
  return path;
}

/**
 * Преобразует прямую линию в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertLineToTikZ(element, scale) {
  const x1 = convertX(element.startX, scale);
  const y1 = convertY(element.startY, scale);
  const x2 = convertX(element.endX, scale);
  const y2 = convertY(element.endY, scale);
  
  return `\\draw[color=${convertColor(element.color)}, line width=${element.lineWidth}pt] (${x1}, ${y1}) -- (${x2}, ${y2});`;
}

/**
 * Преобразует прямоугольник в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertRectangleToTikZ(element, scale) {
  const x1 = convertX(element.startX, scale);
  const y1 = convertY(element.startY, scale);
  const x2 = convertX(element.endX, scale);
  const y2 = convertY(element.endY, scale);
  
  // Определяем верхний левый угол и размеры
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.max(y1, y2);
  const bottom = Math.min(y1, y2);
  
  let options = [`color=${convertColor(element.color)}`, `line width=${element.lineWidth}pt`];
  
  if (element.fill !== 'transparent') {
    options.push(`fill=${convertColor(element.fill)}`);
  }
  
  return `\\draw[${options.join(', ')}] (${left}, ${bottom}) rectangle (${right}, ${top});`;
}

/**
 * Преобразует эллипс в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertEllipseToTikZ(element, scale) {
  const centerX = convertX((element.startX + element.endX) / 2, scale);
  const centerY = convertY((element.startY + element.endY) / 2, scale);
  
  const radiusX = Math.abs(convertX(element.endX, scale) - convertX(element.startX, scale)) / 2;
  const radiusY = Math.abs(convertY(element.endY, scale) - convertY(element.startY, scale)) / 2;
  
  let options = [`color=${convertColor(element.color)}`, `line width=${element.lineWidth}pt`];
  
  if (element.fill !== 'transparent') {
    options.push(`fill=${convertColor(element.fill)}`);
  }
  
  return `\\draw[${options.join(', ')}] (${centerX}, ${centerY}) ellipse (${radiusX} and ${radiusY});`;
}

/**
 * Преобразует текст в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertTextToTikZ(element, scale) {
  const x = convertX(element.x, scale);
  const y = convertY(element.y, scale);
  
  // Размер шрифта в pt
  const fontSize = element.fontSize / 1.5; // Примерное соответствие
  
  return `\\node[color=${convertColor(element.color)}, font=\\fontsize{${fontSize}pt}{${fontSize * 1.2}pt}\\selectfont] at (${x}, ${y}) {${element.text}};`;
}

/**
 * Преобразует стрелку в TikZ код
 * @param {Object} element - элемент рисунка
 * @param {Object} scale - объект с параметрами масштабирования
 * @returns {string} - строка с TikZ кодом
 */
function convertArrowToTikZ(element, scale) {
  const x1 = convertX(element.startX, scale);
  const y1 = convertY(element.startY, scale);
  const x2 = convertX(element.endX, scale);
  const y2 = convertY(element.endY, scale);
  
  return `\\draw[color=${convertColor(element.color)}, line width=${element.lineWidth}pt, ->, >=stealth] (${x1}, ${y1}) -- (${x2}, ${y2});`;
}
