/**
 * Модуль для добавления возможности изменения размера панелей
 * и улучшения интерфейса редактора LaTeX
 */

/**
 * Инициализирует функциональность изменения размера панелей
 */
function initResizablePanels() {
  // Получаем панели
  const editorPane = document.querySelector('.editor-pane');
  const previewPane = document.querySelector('.preview-pane');
  
  if (!editorPane || !previewPane) {
    console.error('Панели редактора или предпросмотра не найдены');
    return;
  }
  
  // Создаем элемент для изменения размера (ресайзер)
  const resizer = document.createElement('div');
  resizer.className = 'resizer';
  editorPane.appendChild(resizer);
  
  // Обработчики для изменения размера с помощью мыши
  let isResizing = false;
  let lastDownX = 0;
  let lastDownY = 0;
  
  // Обработчик нажатия на ресайзер
  resizer.addEventListener('mousedown', function(e) {
    isResizing = true;
    lastDownX = e.clientX;
    lastDownY = e.clientY;
    resizer.classList.add('active');
    
    // Добавляем временные обработчики на весь документ
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Предотвращаем выделение текста при изменении размера
    e.preventDefault();
  });
  
  // Обработчик движения мыши при изменении размера
  function handleMouseMove(e) {
    if (!isResizing) return;
    
    const mainContainer = document.querySelector('main');
    const totalWidth = mainContainer.clientWidth;
    const offset = e.clientX - lastDownX;
    
    // Проверяем, находимся ли мы в мобильном режиме (flexDirection: column)
    const isVerticalLayout = window.getComputedStyle(mainContainer).flexDirection === 'column';
    
    if (isVerticalLayout) {
      // Вертикальный режим (мобильный)
      const totalHeight = mainContainer.clientHeight;
      const editorHeight = editorPane.offsetHeight;
      const newHeight = editorHeight + (e.clientY - lastDownY);
      
      // Ограничиваем минимальную и максимальную высоту
      const minHeight = 150;
      const maxHeight = totalHeight - 150;
      
      if (newHeight > minHeight && newHeight < maxHeight) {
        editorPane.style.height = newHeight + 'px';
        lastDownY = e.clientY;
      }
    } else {
      // Горизонтальный режим (десктоп)
      const editorWidth = editorPane.offsetWidth;
      const newWidth = editorWidth + offset;
      
      // Ограничиваем минимальную и максимальную ширину
      const minWidth = 300;
      const maxWidth = totalWidth - 300;
      
      if (newWidth > minWidth && newWidth < maxWidth) {
        editorPane.style.width = newWidth + 'px';
        lastDownX = e.clientX;
      }
    }
    
    // Обновляем размер редактора CodeMirror
    if (window.editor) {
      window.editor.refresh();
    }
  }
  
  // Обработчик отпускания кнопки мыши
  function handleMouseUp() {
    isResizing = false;
    resizer.classList.remove('active');
    
    // Удаляем временные обработчики
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Сохраняем размеры в localStorage
    saveLayoutSettings();
  }
  
  // Добавляем обработку изменения размера окна
  window.addEventListener('resize', function() {
    // Сбрасываем фиксированные размеры при изменении ориентации или размера окна
    const mainContainer = document.querySelector('main');
    const isVerticalLayout = window.getComputedStyle(mainContainer).flexDirection === 'column';
    
    if (isVerticalLayout) {
      editorPane.style.width = '100%';
      previewPane.style.width = '100%';
    } else {
      if (editorPane.style.height) {
        editorPane.style.height = '';
      }
    }
    
    // Обновляем размер редактора CodeMirror
    if (window.editor) {
      window.editor.refresh();
    }
  });
  
  // Загружаем сохраненные настройки разметки
  loadLayoutSettings();
}

/**
 * Сохраняет настройки разметки в localStorage
 */
function saveLayoutSettings() {
  const editorPane = document.querySelector('.editor-pane');
  if (!editorPane) return;
  
  const mainContainer = document.querySelector('main');
  const isVerticalLayout = window.getComputedStyle(mainContainer).flexDirection === 'column';
  
  const settings = {
    editorWidth: isVerticalLayout ? null : editorPane.offsetWidth,
    editorHeight: isVerticalLayout ? editorPane.offsetHeight : null,
    isVerticalLayout: isVerticalLayout
  };
  
  localStorage.setItem('latex-editor-layout', JSON.stringify(settings));
}

/**
 * Загружает настройки разметки из localStorage
 */
function loadLayoutSettings() {
  const savedLayout = localStorage.getItem('latex-editor-layout');
  if (!savedLayout) return;
  
  try {
    const settings = JSON.parse(savedLayout);
    const editorPane = document.querySelector('.editor-pane');
    const mainContainer = document.querySelector('main');
    
    if (!editorPane || !mainContainer) return;
    
    const isVerticalLayout = window.getComputedStyle(mainContainer).flexDirection === 'column';
    
    // Применяем сохраненные размеры только если текущая ориентация совпадает с сохраненной
    if (isVerticalLayout === settings.isVerticalLayout) {
      if (isVerticalLayout && settings.editorHeight) {
        editorPane.style.height = settings.editorHeight + 'px';
      } else if (!isVerticalLayout && settings.editorWidth) {
        editorPane.style.width = settings.editorWidth + 'px';
      }
    }
  } catch (e) {
    console.error('Ошибка при загрузке настроек разметки:', e);
  }
}

/**
 * Добавляет кнопку для полноэкранного режима редактора
 */
function addFullscreenButton() {
  const editorContainer = document.querySelector('.editor-container');
  if (!editorContainer) return;
  
  // Создаем кнопку полноэкранного режима
  const fullscreenBtn = document.createElement('button');
  fullscreenBtn.id = 'editor-fullscreen-btn';
  fullscreenBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z" fill="#555" />
    </svg>
  `;
  fullscreenBtn.className = 'fullscreen-btn';
  fullscreenBtn.title = 'Полноэкранный режим редактора';
  
  // Добавляем кнопку в контейнер редактора
  editorContainer.appendChild(fullscreenBtn);
  
  // Добавляем обработчик события для переключения полноэкранного режима
  fullscreenBtn.addEventListener('click', function() {
    const editorPane = document.querySelector('.editor-pane');
    if (editorPane) {
      editorPane.classList.toggle('editor-fullscreen');
      
      // Обновляем размер редактора CodeMirror
      if (window.editor) {
        setTimeout(() => {
          window.editor.refresh();
        }, 100);
      }
    }
  });
}

/**
 * Исправляет размеры редактора CodeMirror
 */
function fixCodeMirrorSizes() {
  if (!window.editor) return;
  
  // Обновляем размеры редактора при полной загрузке страницы
  window.addEventListener('load', function() {
    window.editor.refresh();
  });
  
  // Устанавливаем таймаут для обновления размеров,
  // чтобы дать DOM полностью сформироваться
  setTimeout(() => {
    window.editor.refresh();
  }, 500);
}

/**
 * Инициализация всех улучшений интерфейса
 * Вызывается при загрузке страницы
 */
function initInterfaceImprovements() {
  console.log('Инициализация улучшений интерфейса...');
  
  // Добавляем CSS с улучшенными стилями
  addStylesIfNeeded();
  
  // Инициализируем изменение размера панелей
  initResizablePanels();
  
  // Добавляем кнопку полноэкранного режима
  addFullscreenButton();
  
  // Исправляем размеры редактора CodeMirror
  fixCodeMirrorSizes();
  
  console.log('Улучшения интерфейса инициализированы');
}

/**
 * Добавляет необходимые стили, если они еще не были добавлены
 */
function addStylesIfNeeded() {
  if (!document.getElementById('responsive-layout-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'responsive-layout-styles';
    styleElement.textContent = `
      /* Основной контейнер */
      main {
        display: flex;
        flex: 1;
        overflow: hidden;
        height: calc(100vh - 89px);
      }
      
      /* Панель редактора */
      .editor-pane {
        flex: 1;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #ddd;
        min-width: 300px;
        max-width: 70%;
        position: relative;
      }
      
      /* Панель предпросмотра */
      .preview-pane {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 300px;
      }
      
      /* Контейнер редактора */
      .editor-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }
      
      /* CodeMirror */
      .CodeMirror {
        flex: 1 !important;
        height: 100% !important;
        font-size: 14px;
      }
      
      /* Исправление скроллинга в CodeMirror */
      .CodeMirror-scroll {
        height: 100%;
        overflow-y: auto !important;
      }
      
      /* Стили для PDF предпросмотра */
      .preview-container {
        flex: 1;
        overflow: auto;
        background-color: #f5f5f5;
        padding: 16px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      
      #pdf-preview {
        background-color: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 40px;
        width: 210mm;
        min-height: 297mm;
        box-sizing: border-box;
        margin: 20px;
        transform-origin: top center;
      }
      
      /* Ресайзер */
      .resizer {
        width: 8px;
        height: 100%;
        background-color: #f0f0f0;
        position: absolute;
        right: -4px;
        top: 0;
        cursor: col-resize;
        z-index: 10;
        transition: background-color 0.2s;
      }
      
      .resizer:hover,
      .resizer.active {
        background-color: #3498db;
      }
      
      /* Кнопка полноэкранного режима */
      .fullscreen-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #fff;
        border: 1px solid #ddd;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      
      .fullscreen-btn:hover {
        opacity: 1;
      }
      
      /* Стили для полноэкранного режима */
      .editor-fullscreen {
        position: fixed !important;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100% !important;
        height: 100% !important;
        z-index: 1000;
        background-color: white;
      }
      
      /* Мобильные стили */
      @media (max-width: 768px) {
        main {
          flex-direction: column;
        }
        
        .editor-pane, .preview-pane {
          flex: none;
          height: 50%;
          max-width: 100%;
          width: 100%;
        }
        
        .resizer {
          width: 100%;
          height: 8px;
          right: 0;
          bottom: -4px;
          top: auto;
          cursor: row-resize;
        }
      }
      
      /* Стили для PDF контента */
      .pdf-title {
        font-size: 24px;
        text-align: center;
        margin-bottom: 16px;
        font-weight: bold;
      }
      
      .pdf-author, .pdf-date {
        text-align: center;
        margin-bottom: 8px;
        color: #555;
      }
      
      .pdf-section {
        font-size: 18px;
        font-weight: bold;
        margin-top: 24px;
        margin-bottom: 16px;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      
      .pdf-paragraph {
        margin-bottom: 12px;
        line-height: 1.5;
        text-align: justify;
      }
    `;
    document.head.appendChild(styleElement);
    console.log('Добавлены стили для отзывчивого интерфейса');
  }
}

// Инициализируем улучшения при загрузке страницы
document.addEventListener('DOMContentLoaded', initInterfaceImprovements);

// Делаем функции доступными глобально
window.initResizablePanels = initResizablePanels;
window.addFullscreenButton = addFullscreenButton;
window.fixCodeMirrorSizes = fixCodeMirrorSizes;
window.initInterfaceImprovements = initInterfaceImprovements;
