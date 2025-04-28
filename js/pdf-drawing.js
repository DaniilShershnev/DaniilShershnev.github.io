/**
 * pdf-drawing.js
 * Главный модуль для рисования на PDF превью
 */

const PDFDrawing = {
  // Флаг активности режима рисования
  isDrawingModeActive: false,
  
  /**
   * Инициализирует модуль рисования на PDF
   */
  initialize: function() {
    console.log('Инициализация модуля рисования на PDF');
    
    // Инициализируем подмодули
    if (typeof window.PDFPositionMapper !== 'undefined') {
      window.PDFPositionMapper.initialize();
    } else {
      console.error('Модуль PDFPositionMapper не найден');
    }
    
    if (typeof window.PDFInteractionLayer !== 'undefined') {
      window.PDFInteractionLayer.initialize();
    } else {
      console.error('Модуль PDFInteractionLayer не найден');
    }
    
    if (typeof window.PDFDrawingOverlay !== 'undefined') {
      window.PDFDrawingOverlay.initialize();
    } else {
      console.error('Модуль PDFDrawingOverlay не найден');
    }
    
    if (typeof window.PDFInsertionHandler !== 'undefined') {
      window.PDFInsertionHandler.initialize();
    } else {
      console.error('Модуль PDFInsertionHandler не найден');
    }
    
    // Добавляем кнопку для рисования на PDF
    this.addDrawOnPDFButton();
    
    // Устанавливаем обработчики событий
    this.setupEventHandlers();
    
    console.log('Модуль рисования на PDF инициализирован');
  },
  
  /**
   * Добавляет кнопку для рисования на PDF
   */
  addDrawOnPDFButton: function() {
    // Проверяем, существует ли уже такая кнопка
    if (document.getElementById('draw-on-pdf-btn')) return;
    
    // Находим панель инструментов предпросмотра
    const previewToolbar = document.querySelector('.preview-pane .toolbar');
    if (!previewToolbar) {
      console.error('Панель инструментов предпросмотра не найдена');
      return;
    }
    
    // Создаем кнопку
    const drawButton = document.createElement('button');
    drawButton.id = 'draw-on-pdf-btn';
    drawButton.textContent = 'Рисовать на PDF';
    drawButton.title = 'Нажмите, чтобы добавить рисунок в документ PDF';
    
    // Добавляем кнопку в панель инструментов
    previewToolbar.appendChild(drawButton);
    
    // Добавляем обработчик события
    drawButton.addEventListener('click', () => {
      this.enterDrawingMode();
    });
  },
  
  /**
   * Устанавливает обработчики событий
   */
  setupEventHandlers: function() {
    // Обработчик события вставки рисунка
    document.addEventListener('drawing-inserted', () => {
      this.exitDrawingMode();
      
      // Запускаем компиляцию документа
      if (typeof window.compileLatex === 'function') {
        window.compileLatex();
      }
    });
  },
  
  /**
   * Входит в режим рисования на PDF
   */
  enterDrawingMode: function() {
    console.log('Вход в режим рисования на PDF');
    
    this.isDrawingModeActive = true;
    
    // Активируем слой взаимодействия
    if (window.PDFInteractionLayer) {
      window.PDFInteractionLayer.activate();
    }
    
    // Изменяем стиль кнопки
    const drawButton = document.getElementById('draw-on-pdf-btn');
    if (drawButton) {
      drawButton.classList.add('active');
    }
  },
  
  /**
   * Выходит из режима рисования на PDF
   */
  exitDrawingMode: function() {
    console.log('Выход из режима рисования на PDF');
    
    this.isDrawingModeActive = false;
    
    // Деактивируем слой взаимодействия
    if (window.PDFInteractionLayer) {
      window.PDFInteractionLayer.deactivate();
    }
    
    // Скрываем слой рисования
    if (window.PDFDrawingOverlay) {
      window.PDFDrawingOverlay.hide();
    }
    
    // Изменяем стиль кнопки
    const drawButton = document.getElementById('draw-on-pdf-btn');
    if (drawButton) {
      drawButton.classList.remove('active');
    }
  },
  
  /**
   * Переключает режим рисования на PDF
   */
  toggleDrawingMode: function() {
    if (this.isDrawingModeActive) {
      this.exitDrawingMode();
    } else {
      this.enterDrawingMode();
    }
  }
};

// Делаем объект доступным глобально
window.PDFDrawing = PDFDrawing;

// Инициализируем модуль после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
  // Выполняем с небольшой задержкой, чтобы убедиться, что все зависимости загружены
  setTimeout(() => {
    if (typeof window.PDFDrawing !== 'undefined') {
      window.PDFDrawing.initialize();
    }
  }, 500);
});
