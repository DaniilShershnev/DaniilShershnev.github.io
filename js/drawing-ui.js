/**
 * Модуль пользовательского интерфейса редактора рисования
 * Отвечает за создание и управление UI элементами редактора рисования
 */
let isDrawingUIInitialized = false;

function initDrawingUI() {
  // Если UI уже инициализирован, просто показываем его
  if (isDrawingUIInitialized) {
    const modal = document.getElementById('drawing-modal');
    if (modal) {
      modal.style.display = 'block';
      return;
    }
  }
  
  // Иначе создаем UI с нуля
  createDrawingModal();
  setupDrawingUIEvents();
  isDrawingUIInitialized = true;
}
// Объявим переменную для доступа к функции закрытия редактора
let closeDrawingEditor;

/**
 * Инициализирует пользовательский интерфейс редактора рисования
 */
function initDrawingUI() {
  // Если модальное окно уже существует, не создаем его повторно
  if (document.getElementById('drawing-modal')) {
    return;
  }
  
  // Создаем модальное окно
  createDrawingModal();
  
  // Устанавливаем обработчики событий
  setupDrawingUIEvents();
}

/**
 * Создает модальное окно редактора рисования
 */
function createDrawingModal() {
  // Создаем элемент модального окна
  const modal = document.createElement('div');
  modal.id = 'drawing-modal';
  modal.className = 'modal';
  
  // Создаем содержимое модального окна
  modal.innerHTML = `
    <div class="modal-content drawing-modal-content">
      <span class="close">&times;</span>
      <h2>Редактор рисования</h2>
      
      <div class="drawing-toolbar">
        <div class="drawing-tools-group">
          <button class="drawing-tool active" data-tool="freehand" title="Свободное рисование">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25z M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.39-0.39-1.02-0.39-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z"/>
            </svg>
          </button>
          <button class="drawing-tool" data-tool="line" title="Линия">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19,13H5v-2h14V13z"/>
            </svg>
          </button>
          <button class="drawing-tool" data-tool="arrow" title="Стрелка">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M8,5v14l11-7L8,5z"/>
            </svg>
          </button>
          <button class="drawing-tool" data-tool="rectangle" title="Прямоугольник">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z"/>
            </svg>
          </button>
          <button class="drawing-tool" data-tool="ellipse" title="Эллипс">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/>
            </svg>
          </button>
          <button class="drawing-tool" data-tool="text" title="Текст">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M5,17v2h14v-2H5z M9.5,12.8h5l0.9,2.2h2.1L12.75,4h-1.5L6.5,15h2.1L9.5,12.8z M12,5.98L13.87,11h-3.74L12,5.98z"/>
            </svg>
          </button>
        </div>
        
        <div class="drawing-settings-group">
          <div class="tool-option" id="color-option">
            <label for="drawing-color">Цвет:</label>
            <input type="color" id="drawing-color" value="#000000">
          </div>
          
          <div class="tool-option" id="line-width-option">
            <label for="drawing-line-width">Толщина: <span id="line-width-value">2</span>px</label>
            <input type="range" id="drawing-line-width" min="1" max="20" value="2">
          </div>
          
          <div class="tool-option" id="fill-option" style="display: none;">
            <label>
              <input type="checkbox" id="drawing-fill-enabled">
              Заливка
            </label>
            <input type="color" id="drawing-fill" value="#ffffff" disabled>
          </div>
          
          <div class="tool-option" id="font-option" style="display: none;">
            <label for="drawing-font-size">Размер: <span id="font-size-value">16</span>px</label>
            <input type="range" id="drawing-font-size" min="8" max="48" value="16">
          </div>
          
          <button id="drawing-clear" class="secondary-btn" title="Очистить холст">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M19,4h-3.5l-1-1h-5l-1,1H5v2h14V4z M6,19c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V7H6V19z M8,9h8v10H8V9z"/>
            </svg>
            Очистить
          </button>
        </div>
      </div>
      
      <div id="drawing-canvas-container" class="drawing-canvas-container">
        <canvas id="drawing-canvas"></canvas>
      </div>
      
      <div class="drawing-actions">
        <button id="drawing-cancel" class="secondary-btn">Отмена</button>
        <button id="drawing-insert" class="primary-btn">Вставить в документ</button>
      </div>
    </div>
  `;
  modal.innerHTML = `
  <div class="modal-content drawing-modal-content">
    const styleElement = document.createElement('style');
styleElement.textContent = `
  .drawing-modal-content.pdf-mode {
    border: 3px solid #3498db;
  }
  
  .drawing-mode-indicator {
    background-color: #3498db;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;
document.head.appendChild(styleElement);
  </div>
`;
  // Добавляем модальное окно в документ
  document.body.appendChild(modal);
}

/**
 * Устанавливает обработчики событий для UI редактора рисования
 */
function setupDrawingUIEvents() {
  // Закрытие модального окна
  document.querySelector('#drawing-modal .close').addEventListener('click', function() {
    const modal = document.getElementById('drawing-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  });
  
  // Кнопка отмены
  document.getElementById('drawing-cancel').addEventListener('click', function() {
    const modal = document.getElementById('drawing-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  });
  
  // Кнопка вставки
  document.getElementById('drawing-insert').addEventListener('click', function() {
    // Получаем TikZ-код
    if (typeof convertToTikZ !== 'function') {
      console.warn('Функция convertToTikZ не определена');
      return;
    }
    
    const tikzCode = convertToTikZ();
    
    // Получаем позицию курсора в редакторе LaTeX
    const cursor = editor.getCursor();
    
    // Формируем код с окружением tikzpicture
    const fullCode = `\\begin{tikzpicture}\n${tikzCode}\n\\end{tikzpicture}`;
    
    // Вставляем в редактор
    editor.replaceRange(fullCode, cursor);
    
    // Закрываем редактор рисования
    const modal = document.getElementById('drawing-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    // Обновляем статус
    if (typeof updateStatus === 'function') {
      updateStatus('Рисунок вставлен');
    }
  });
  
  // Закрытие модального окна при клике вне содержимого
  document.getElementById('drawing-modal').addEventListener('click', function(event) {
    if (event.target === this) {
      this.style.display = 'none';
    }
  });
  
  // Обработка изменения размера окна
  window.addEventListener('resize', function() {
    if (document.getElementById('drawing-modal').style.display === 'block') {
      if (typeof resetCanvasSize === 'function') {
        resetCanvasSize();
      }
      if (typeof redrawCanvas === 'function') {
        redrawCanvas();
      }
    }
  });
  // Кнопка вставки
document.getElementById('drawing-insert').addEventListener('click', function() {
  // Получаем TikZ-код
  if (typeof convertToTikZ !== 'function') {
    console.warn('Функция convertToTikZ не определена');
    return;
  }
  
  const tikzCode = convertToTikZ();
  
  // Проверяем, находимся ли в режиме рисования на PDF
  if (typeof isDrawingEditorInPdfMode === 'function' && isDrawingEditorInPdfMode()) {
    // В режиме рисования на PDF обработкой вставки занимается PDFInsertionHandler
    return;
  }
  
  // Стандартное поведение - вставка в текущую позицию курсора
  const cursor = editor.getCursor();
  
  // Формируем код с окружением tikzpicture
  const fullCode = `\\begin{tikzpicture}\n${tikzCode}\n\\end{tikzpicture}`;
  
  // Вставляем в редактор
  editor.replaceRange(fullCode, cursor);
  
  // Закрываем редактор рисования
  const modal = document.getElementById('drawing-modal');
  if (modal) {
    modal.style.display = 'none';
  }
  
  // Обновляем статус
  if (typeof updateStatus === 'function') {
    updateStatus('Рисунок вставлен');
  }
});
}

// Экспортируем функции в глобальную область видимости
window.initDrawingUI = initDrawingUI;
window.createDrawingModal = createDrawingModal;
