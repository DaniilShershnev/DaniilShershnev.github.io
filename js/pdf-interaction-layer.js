/**
 * Модифицированный модуль PDFInteractionLayer для правильной работы режима рисования на PDF
 * Замените содержимое файла js/pdf-interaction-layer.js
 */

const PDFInteractionLayer = {
  // Флаг активности слоя взаимодействия
  isActive: false,
  
  // Ссылка на элемент слоя
  element: null,
  
  /**
   * Инициализирует слой взаимодействия с PDF
   * @returns {Object} - текущий объект PDFInteractionLayer
   */
  initialize: function() {
    console.log('Инициализация слоя взаимодействия с PDF');
    
    // Создаем слой, если его еще нет
    this.createLayer();
    
    // Инициализируем обработчики событий
    this.setupEventHandlers();
    
    return this;
  },
  
  /**
   * Создает слой взаимодействия
   */
  createLayer: function() {
    // Проверяем, существует ли уже слой
    if (document.getElementById('pdf-interaction-layer')) {
      this.element = document.getElementById('pdf-interaction-layer');
      return;
    }
    
    // Получаем контейнер предпросмотра
    const previewContainer = document.querySelector('.preview-container');
    if (!previewContainer) {
      console.error('Контейнер предпросмотра не найден');
      return;
    }
    
    // Создаем элемент слоя
    const layer = document.createElement('div');
    layer.id = 'pdf-interaction-layer';
    layer.className = 'pdf-interaction-layer';
    layer.style.position = 'absolute';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.right = '0';
    layer.style.bottom = '0';
    layer.style.zIndex = '50';
    layer.style.display = 'none';
    layer.style.cursor = 'pointer';
    
    // Добавляем слой в контейнер
    previewContainer.appendChild(layer);
    
    // Сохраняем ссылку на элемент
    this.element = layer;
    
    console.log('Слой взаимодействия с PDF создан');
  },
  
  /**
   * Устанавливает обработчики событий
   */
  setupEventHandlers: function() {
    if (!this.element) return;
    
    // Обработчик клика для выбора позиции вставки
    this.element.addEventListener('click', (e) => {
      if (!this.isActive) return;
      
      console.log('Клик на PDF для выбора позиции вставки');
      
      // Получаем координаты клика относительно предпросмотра
      const previewElement = document.getElementById('pdf-preview');
      const rect = previewElement.getBoundingClientRect();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Находим элемент, на котором произошел клик
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
      
      // Находим ближайший подходящий элемент PDF (параграф, секция и т.д.)
      let targetElement = elementAtPoint;
      while (targetElement && targetElement !== previewElement) {
        if (targetElement.classList.contains('pdf-paragraph') || 
            targetElement.classList.contains('pdf-section') ||
            targetElement.classList.contains('pdf-figure') ||
            targetElement.classList.contains('pdf-table')) {
          break;
        }
        targetElement = targetElement.parentElement;
      }
      
      // Если не нашли подходящий элемент, используем сам предпросмотр
      if (!targetElement || targetElement === previewElement) {
        targetElement = previewElement;
      }
      
      // Находим соответствующую позицию в документе
      if (window.PDFPositionMapper) {
        const insertPosition = window.PDFPositionMapper.findInsertPosition(targetElement);
        
        // Устанавливаем позицию вставки в обработчик вставки
        if (window.PDFInsertionHandler) {
          window.PDFInsertionHandler.setInsertPosition(insertPosition);
        }
        
        // Показываем слой рисования с указанными координатами
        if (window.PDFDrawingOverlay) {
          window.PDFDrawingOverlay.show(x, y);
        }
        
        // Открываем редактор рисования в режиме PDF
        if (typeof window.openDrawingEditor === 'function') {
          window.openDrawingEditor(true);
        }
      }
      
      // Деактивируем слой взаимодействия
      this.deactivate();
    });
    
    console.log('Обработчики событий для слоя взаимодействия с PDF установлены');
  },
  
  /**
   * Активирует слой взаимодействия
   */
  activate: function() {
    if (!this.element) return;
    
    console.log('Активация слоя взаимодействия с PDF');
    
    this.isActive = true;
    this.element.style.display = 'block';
    
    // Показываем инструкции для пользователя
    this.showInstructions();
  },
  
  /**
   * Деактивирует слой взаимодействия
   */
  deactivate: function() {
    if (!this.element) return;
    
    console.log('Деактивация слоя взаимодействия с PDF');
    
    this.isActive = false;
    this.element.style.display = 'none';
    
    // Скрываем инструкции
    this.hideInstructions();
  },
  
  /**
   * Показывает инструкции для пользователя
   */
  showInstructions: function() {
    // Удаляем существующие инструкции, если они есть
    this.hideInstructions();
    
    // Создаем элемент с инструкциями
    const instructions = document.createElement('div');
    instructions.id = 'pdf-drawing-instructions';
    instructions.className = 'pdf-drawing-instructions';
    
    instructions.innerHTML = `
      <div class="instructions-content">
        <h3>Выберите место для рисунка</h3>
        <p>Щелкните на точку в документе, где вы хотите добавить рисунок.</p>
        <p>Затем откроется редактор рисования.</p>
        <button id="cancel-pdf-drawing">Отмена</button>
      </div>
    `;
    
    // Добавляем инструкции в body
    document.body.appendChild(instructions);
    
    // Добавляем обработчик для кнопки отмены
    document.getElementById('cancel-pdf-drawing').addEventListener('click', () => {
      this.deactivate();
      
      // Если есть PDFDrawing, выходим из режима рисования
      if (window.PDFDrawing) {
        window.PDFDrawing.exitDrawingMode();
      }
    });
    
    console.log('Инструкции для рисования на PDF отображены');
  },
  
  /**
   * Скрывает инструкции
   */
  hideInstructions: function() {
    const instructions = document.getElementById('pdf-drawing-instructions');
    if (instructions) {
      instructions.remove();
    }
  }
};

// Делаем объект доступным глобально
window.PDFInteractionLayer = PDFInteractionLayer;
