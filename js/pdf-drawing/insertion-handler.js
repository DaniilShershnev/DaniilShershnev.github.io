/**
 * insertion-handler.js
 * Модуль для вставки созданного рисунка в LaTeX документ
 */

const PDFInsertionHandler = {
  // Позиция вставки в документе
  insertPosition: null,
  
  // Данные о рисунке
  drawingData: null,
  
  // Оригинальные обработчики событий редактора рисования
  originalHandlers: {
    insertDrawing: null
  },
  
  /**
   * Инициализирует обработчик вставки рисунка
   * @returns {Object} - текущий объект PDFInsertionHandler
   */
  initialize: function() {
    console.log('Инициализация обработчика вставки рисунка');
    
    // Сохраняем оригинальные обработчики перед их заменой
    if (window.openDrawingEditor) {
      const originalOpenDrawingEditor = window.openDrawingEditor;
      
      // Заменяем функцию открытия редактора рисования на свою версию
      window.openDrawingEditor = function(isPdfDrawingMode) {
        if (isPdfDrawingMode) {
          PDFInsertionHandler.setupDrawingEditorForPdfMode();
        }
        
        // Вызываем оригинальную функцию
        originalOpenDrawingEditor();
      };
    }
    
    return this;
  },
  
  /**
   * Настраивает редактор рисования для режима рисования на PDF
   */
  setupDrawingEditorForPdfMode: function() {
    console.log('Настройка редактора рисования для режима PDF');
    
    // Находим модальное окно редактора рисования
    const modal = document.getElementById('drawing-modal');
    if (!modal) {
      console.error('Модальное окно редактора рисования не найдено');
      return;
    }
    
    // Изменяем заголовок модального окна
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
      this.originalModalTitle = modalTitle.textContent;
      modalTitle.textContent = 'Рисование на PDF';
    }
    
    // Находим кнопку вставки рисунка
    const insertButton = document.getElementById('drawing-insert');
    if (insertButton) {
      this.originalInsertButtonText = insertButton.textContent;
      insertButton.textContent = 'Вставить в документ';
      
      // Сохраняем оригинальный обработчик события
      const originalClickHandler = insertButton.onclick;
      this.originalHandlers.insertDrawing = originalClickHandler;
      
      // Заменяем обработчик события на свой
      insertButton.onclick = (event) => {
        // Предотвращаем стандартное поведение
        event.preventDefault();
        
        // Вызываем нашу функцию вставки рисунка
        this.insertDrawingToDocument();
        
        // Закрываем модальное окно редактора
        modal.style.display = 'none';
        
        // Восстанавливаем оригинальные элементы интерфейса
        this.restoreDrawingEditorUI();
      };
    }
    
    // Находим кнопку отмены
    const cancelButton = document.getElementById('drawing-cancel');
    if (cancelButton) {
      // Сохраняем оригинальный обработчик события
      const originalCancelHandler = cancelButton.onclick;
      this.originalHandlers.cancelDrawing = originalCancelHandler;
      
      // Заменяем обработчик события на свой
      cancelButton.onclick = (event) => {
        // Предотвращаем стандартное поведение
        event.preventDefault();
        
        // Закрываем модальное окно редактора
        modal.style.display = 'none';
        
        // Восстанавливаем оригинальные элементы интерфейса
        this.restoreDrawingEditorUI();
        
        // Отключаем режим рисования на PDF
        if (window.PDFDrawing) {
          window.PDFDrawing.exitDrawingMode();
        }
      };
    }
    
    // Подсказка о режиме рисования на PDF
    const pdfModeIndicator = document.createElement('div');
    pdfModeIndicator.id = 'pdf-drawing-mode-indicator';
    pdfModeIndicator.className = 'drawing-pdf-mode-indicator';
    pdfModeIndicator.innerHTML = 'Режим рисования на PDF';
    pdfModeIndicator.style.position = 'absolute';
    pdfModeIndicator.style.top = '10px';
    pdfModeIndicator.style.right = '10px';
    pdfModeIndicator.style.backgroundColor = 'rgba(52, 152, 219, 0.8)';
    pdfModeIndicator.style.color = 'white';
    pdfModeIndicator.style.padding = '5px 10px';
    pdfModeIndicator.style.borderRadius = '4px';
    pdfModeIndicator.style.zIndex = '1000';
    
    modal.appendChild(pdfModeIndicator);
  },
  
  /**
   * Восстанавливает оригинальный интерфейс редактора рисования
   */
  restoreDrawingEditorUI: function() {
    // Восстанавливаем заголовок модального окна
    const modalTitle = document.querySelector('#drawing-modal h2');
    if (modalTitle && this.originalModalTitle) {
      modalTitle.textContent = this.originalModalTitle;
    }
    
    // Восстанавливаем текст кнопки вставки
    const insertButton = document.getElementById('drawing-insert');
    if (insertButton && this.originalInsertButtonText) {
      insertButton.textContent = this.originalInsertButtonText;
    }
    
    // Восстанавливаем оригинальные обработчики событий
    if (insertButton && this.originalHandlers.insertDrawing) {
      insertButton.onclick = this.originalHandlers.insertDrawing;
    }
    
    const cancelButton = document.getElementById('drawing-cancel');
    if (cancelButton && this.originalHandlers.cancelDrawing) {
      cancelButton.onclick = this.originalHandlers.cancelDrawing;
    }
    
    // Удаляем индикатор режима рисования на PDF
    const indicator = document.getElementById('pdf-drawing-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
  },
  
  /**
   * Устанавливает позицию для вставки рисунка в документе
   * @param {Object} position - позиция в документе
   */
  setInsertPosition: function(position) {
    this.insertPosition = position;
    console.log('Установлена позиция для вставки рисунка:', position);
  },
  
  /**
   * Вставляет созданный рисунок в LaTeX документ
   */
  insertDrawingToDocument: function() {
    // Проверяем, есть ли позиция для вставки
    if (!this.insertPosition) {
      console.error('Позиция для вставки рисунка не установлена');
      return;
    }
    
    try {
      // Получаем TikZ-код из редактора рисования
      const tikzCode = this.generateTikZCode();
      
      if (!tikzCode) {
        console.error('Не удалось сгенерировать TikZ-код');
        return;
      }
      
      // Вставляем код в документ
      this.insertTikZToDocument(tikzCode);
      
      // Генерируем событие успешной вставки
      document.dispatchEvent(new CustomEvent('drawing-inserted'));
      
      // Сбрасываем позицию вставки
      this.insertPosition = null;
      
    } catch (error) {
      console.error('Ошибка при вставке рисунка:', error);
      
      // Показываем сообщение об ошибке
      updateStatus('Ошибка при вставке рисунка: ' + error.message);
    }
  },
  
  /**
   * Генерирует TikZ-код из текущего рисунка в редакторе
   * @returns {string} - TikZ-код рисунка
   */
  generateTikZCode: function() {
    // Проверяем, доступна ли функция конвертации в TikZ
    if (typeof convertToTikZ !== 'function') {
      console.error('Функция convertToTikZ не определена');
      return null;
    }
    
    // Генерируем TikZ-код
    return convertToTikZ();
  },
  
  /**
   * Вставляет TikZ-код в LaTeX документ
   * @param {string} tikzCode - TikZ-код рисунка
   */
  insertTikZToDocument: function(tikzCode) {
    // Проверяем наличие редактора
    if (!editor) {
      console.error('Редактор не инициализирован');
      return;
    }
    
    // Получаем текущий текст документа
    const documentText = editor.getValue();
    
    // Проверяем наличие пакета tikz в преамбуле
    if (!documentText.includes('\\usepackage{tikz}')) {
      // Находим конец преамбулы
      const beginDocIndex = documentText.indexOf('\\begin{document}');
      if (beginDocIndex > -1) {
        // Вставляем пакет tikz перед началом документа
        const beforeDoc = documentText.substring(0, beginDocIndex);
        const afterDoc = documentText.substring(beginDocIndex);
        
        // Добавляем пакет tikz
        const updatedText = beforeDoc + '\\usepackage{tikz}\n' + afterDoc;
        editor.setValue(updatedText);
        
        // Обновляем документ в переменной
        documentText = updatedText;
      }
    }
    
    // Формируем окружение tikzpicture
    const tikzEnvironment = `\\begin{figure}[h]
  \\centering
  \\begin{tikzpicture}
${tikzCode}
  \\end{tikzpicture}
  \\caption{Рисунок}
\\end{figure}`;
    
    // Вставляем рисунок в позицию, определенную ранее
    const position = this.insertPosition.position;
    
    // Создаем объект позиции для CodeMirror
    const insertPos = editor.posFromIndex(position);
    
    // Вставляем TikZ-код в документ
    editor.replaceRange('\n' + tikzEnvironment + '\n', insertPos);
    
    // Обновляем статус
    updateStatus('Рисунок успешно вставлен в документ');
  }
};

// Делаем объект доступным глобально
window.PDFInsertionHandler = PDFInsertionHandler;
