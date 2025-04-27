/**
 * drawing-overlay.js
 * Модуль для создания и управления слоем для рисования поверх PDF превью
 */

const PDFDrawingOverlay = {
  // DOM элемент слоя рисования
  element: null,
  
  // Канвас для рисования
  canvas: null,
  
  // Контекст рисования
  context: null,
  
  // Текущие координаты для привязки
  currentX: 0,
  currentY: 0,
  
  /**
   * Инициализирует слой для рисования
   * @returns {Object} - текущий объект PDFDrawingOverlay
   */
  initialize: function() {
    console.log('Инициализация слоя рисования на PDF превью');
    
    // Получаем контейнер PDF превью
    const previewContainer = document.querySelector('.preview-container');
    if (!previewContainer) {
      console.error('Контейнер превью не найден');
      return this;
    }
    
    // Создаем слой для рисования
    const overlayElement = document.createElement('div');
    overlayElement.id = 'pdf-drawing-overlay';
    overlayElement.className = 'pdf-drawing-overlay';
    overlayElement.style.position = 'absolute';
    overlayElement.style.top = '0';
    overlayElement.style.left = '0';
    overlayElement.style.right = '0';
    overlayElement.style.bottom = '0';
    overlayElement.style.zIndex = '60';
    overlayElement.style.display = 'none';
    
    // Создаем канвас для предпросмотра рисования
    const canvas = document.createElement('canvas');
    canvas.id = 'pdf-drawing-canvas';
    canvas.className = 'pdf-drawing-canvas';
    canvas.style.position = 'absolute';
    canvas.width = previewContainer.offsetWidth;
    canvas.height = previewContainer.offsetHeight;
    
    // Добавляем канвас в слой
    overlayElement.appendChild(canvas);
    
    // Добавляем слой в контейнер
    previewContainer.appendChild(overlayElement);
    
    // Сохраняем ссылки на элементы
    this.element = overlayElement;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    
    // Устанавливаем обработчики событий изменения размеров
    window.addEventListener('resize', () => this.resizeCanvas());
    
    return this;
  },
  
  /**
   * Показывает слой рисования в заданной позиции
   * @param {number} x - координата X
   * @param {number} y - координата Y
   */
  show: function(x, y) {
    if (!this.element) return;
    
    // Сохраняем текущие координаты
    this.currentX = x;
    this.currentY = y;
    
    // Отображаем слой
    this.element.style.display = 'block';
    
    // Очищаем канвас
    this.clearCanvas();
    
    // Рисуем индикатор позиции
    this.drawPositionIndicator(x, y);
  },
  
  /**
   * Скрывает слой рисования
   */
  hide: function() {
    if (!this.element) return;
    
    this.element.style.display = 'none';
  },
  
  /**
   * Изменяет размеры канваса при изменении размеров окна
   */
  resizeCanvas: function() {
    if (!this.canvas || !this.element) return;
    
    const previewContainer = document.querySelector('.preview-container');
    if (!previewContainer) return;
    
    this.canvas.width = previewContainer.offsetWidth;
    this.canvas.height = previewContainer.offsetHeight;
    
    // Перерисовываем индикатор позиции, если слой видим
    if (this.element.style.display !== 'none') {
      this.clearCanvas();
      this.drawPositionIndicator(this.currentX, this.currentY);
    }
  },
  
  /**
   * Очищает канвас
   */
  clearCanvas: function() {
    if (!this.context || !this.canvas) return;
    
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  
  /**
   * Рисует индикатор текущей позиции
   * @param {number} x - координата X
   * @param {number} y - координата Y
   */
  drawPositionIndicator: function(x, y) {
    if (!this.context) return;
    
    const ctx = this.context;
    
    // Сохраняем текущее состояние контекста
    ctx.save();
    
    // Рисуем пульсирующую окружность
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.fill();
    
    // Рисуем окружность поменьше
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
    ctx.fill();
    
    // Рисуем перекрестие
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Восстанавливаем состояние контекста
    ctx.restore();
    
    // Добавляем анимацию пульсации (можно реализовать через requestAnimationFrame)
    this.animatePulse(x, y);
  },
  
  /**
   * Анимирует пульсацию для индикатора позиции
   * @param {number} x - координата X
   * @param {number} y - координата Y
   */
  animatePulse: function(x, y) {
    let radius = 10;
    let opacity = 0.3;
    let growing = true;
    
    const animate = () => {
      if (!this.context || this.element.style.display === 'none') return;
      
      // Изменяем размер и прозрачность
      if (growing) {
        radius += 0.5;
        opacity -= 0.01;
        if (radius >= 25) growing = false;
      } else {
        radius -= 0.5;
        opacity += 0.01;
        if (radius <= 10) growing = true;
      }
      
      // Перерисовываем пульсирующую окружность
      this.clearCanvas();
      
      const ctx = this.context;
      
      // Рисуем пульсирующую окружность
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(52, 152, 219, ${opacity})`;
      ctx.fill();
      
      // Рисуем окружность поменьше
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(52, 152, 219, 0.6)';
      ctx.fill();
      
      // Рисуем перекрестие
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.moveTo(x, y - 15);
      ctx.lineTo(x, y + 15);
      ctx.strokeStyle = 'rgba(52, 152, 219, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Продолжаем анимацию
      requestAnimationFrame(animate);
    };
    
    // Запускаем анимацию
    requestAnimationFrame(animate);
  },
  
  /**
   * Получает текущие координаты привязки
   * @returns {Object} - объект с координатами {x, y}
   */
  getCurrentPosition: function() {
    return {
      x: this.currentX,
      y: this.currentY
    };
  }
};

// Делаем объект доступным глобально
window.PDFDrawingOverlay = PDFDrawingOverlay;
