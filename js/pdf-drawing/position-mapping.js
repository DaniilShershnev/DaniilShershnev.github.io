/**
 * position-mapping.js
 * Модуль для отображения позиций между документом LaTeX и PDF предпросмотром
 */

const PDFPositionMapper = {
  // Массив маркеров, связывающих элементы PDF с позициями в документе
  positionMarkers: [],
  
  /**
   * Инициализирует модуль отображения позиций
   * @returns {Object} - текущий объект PDFPositionMapper
   */
  initialize: function() {
    console.log('Инициализация модуля отображения позиций');
    
    // Очищаем существующие маркеры
    this.positionMarkers = [];
    
    // Устанавливаем обработчики событий
    document.addEventListener('after-latex-compile', this.mapPositions.bind(this));
    
    return this;
  },
  
  /**
   * Создает маппинг позиций между документом и PDF
   */
  mapPositions: function() {
    console.log('Создание маппинга позиций');
    
    // Очищаем старые маркеры
    this.positionMarkers = [];
    
    // Получаем текущий LaTeX код и элементы PDF
    const latexCode = editor ? editor.getValue() : '';
    const pdfPreview = document.getElementById('pdf-preview');
    
    if (!latexCode || !pdfPreview) return;
    
    // Находим все секции
    this.mapSections(latexCode, pdfPreview);
    
    // Находим все параграфы
    this.mapParagraphs(latexCode, pdfPreview);
    
    // Находим все рисунки
    this.mapFigures(latexCode, pdfPreview);
    
    // Находим все таблицы
    this.mapTables(latexCode, pdfPreview);
    
    console.log(`Создано ${this.positionMarkers.length} позиционных маркеров`);
  },
  
  /**
   * Создает маппинг секций
   * @param {string} latexCode - LaTeX код документа
   * @param {HTMLElement} pdfPreview - элемент предпросмотра PDF
   */
  mapSections: function(latexCode, pdfPreview) {
    // Находим все секции в LaTeX коде
    const sectionRegex = /\\section\{([^}]*)\}/g;
    let sectionMatch;
    
    // Находим все элементы секций в предпросмотре
    const sectionElements = pdfPreview.querySelectorAll('.pdf-section');
    
    let sectionIndex = 0;
    while ((sectionMatch = sectionRegex.exec(latexCode)) !== null && sectionIndex < sectionElements.length) {
      const sectionTitle = sectionMatch[1];
      const sectionElement = sectionElements[sectionIndex];
      
      if (sectionElement.textContent.trim() === sectionTitle.trim()) {
        // Добавляем маркер
        this.positionMarkers.push({
          latexPosition: sectionMatch.index,
          htmlElement: sectionElement,
          type: 'section',
          title: sectionTitle
        });
        
        sectionIndex++;
      }
    }
  },
  
  /**
   * Создает маппинг параграфов
   * @param {string} latexCode - LaTeX код документа
   * @param {HTMLElement} pdfPreview - элемент предпросмотра PDF
   */
  mapParagraphs: function(latexCode, pdfPreview) {
    // Находим все параграфы в предпросмотре
    const paragraphElements = pdfPreview.querySelectorAll('.pdf-paragraph');
    
    // Проходим по всем параграфам и ищем соответствующий текст в LaTeX
    paragraphElements.forEach(paragraphElement => {
      const paragraphText = paragraphElement.textContent.trim();
      
      if (paragraphText.length > 20) {
        // Ищем текст в LaTeX коде (упрощенный подход)
        const escapedText = paragraphText.substring(0, 50)
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/\s+/g, '\\s+');
        
        try {
          const paragraphRegex = new RegExp(escapedText, 'i');
          const paragraphMatch = latexCode.match(paragraphRegex);
          
          if (paragraphMatch) {
            // Добавляем маркер
            this.positionMarkers.push({
              latexPosition: paragraphMatch.index,
              htmlElement: paragraphElement,
              type: 'paragraph',
              text: paragraphText.substring(0, 50) + '...'
            });
          }
        } catch (e) {
          console.error('Ошибка при поиске соответствия параграфа:', e);
        }
      }
    });
  },
  
  /**
   * Создает маппинг рисунков
   * @param {string} latexCode - LaTeX код документа
   * @param {HTMLElement} pdfPreview - элемент предпросмотра PDF
   */
  mapFigures: function(latexCode, pdfPreview) {
    // Находим все рисунки в LaTeX коде
    const figureRegex = /\\begin\{figure\}[\s\S]*?\\end\{figure\}/g;
    let figureMatch;
    
    // Находим все элементы рисунков в предпросмотре
    const figureElements = pdfPreview.querySelectorAll('.pdf-figure');
    
    let figureIndex = 0;
    while ((figureMatch = figureRegex.exec(latexCode)) !== null && figureIndex < figureElements.length) {
      const figureElement = figureElements[figureIndex];
      
      // Добавляем маркер
      this.positionMarkers.push({
        latexPosition: figureMatch.index,
        htmlElement: figureElement,
        type: 'figure',
        text: 'Figure ' + (figureIndex + 1)
      });
      
      figureIndex++;
    }
  },
  
  /**
   * Создает маппинг таблиц
   * @param {string} latexCode - LaTeX код документа
   * @param {HTMLElement} pdfPreview - элемент предпросмотра PDF
   */
  mapTables: function(latexCode, pdfPreview) {
    // Находим все таблицы в LaTeX коде
    const tableRegex = /\\begin\{table\}[\s\S]*?\\end\{table\}/g;
    let tableMatch;
    
    // Находим все элементы таблиц в предпросмотре
    const tableElements = pdfPreview.querySelectorAll('.pdf-table');
    
    let tableIndex = 0;
    while ((tableMatch = tableRegex.exec(latexCode)) !== null && tableIndex < tableElements.length) {
      const tableElement = tableElements[tableIndex];
      
      // Добавляем маркер
      this.positionMarkers.push({
        latexPosition: tableMatch.index,
        htmlElement: tableElement,
        type: 'table',
        text: 'Table ' + (tableIndex + 1)
      });
      
      tableIndex++;
    }
  },
  
  /**
   * Находит позицию вставки ближайшую к указанному HTML элементу
   * @param {HTMLElement} element - HTML элемент
   * @returns {Object} - информация о позиции вставки
   */
  findInsertPosition: function(element) {
    // Если указан конкретный элемент, ищем его маркер
    if (element) {
      // Проверяем, есть ли прямое соответствие
      for (const marker of this.positionMarkers) {
        if (marker.htmlElement === element || marker.htmlElement.contains(element)) {
          return {
            position: marker.latexPosition,
            type: 'direct-match',
            elementType: marker.type
          };
        }
      }
      
      // Ищем ближайший предыдущий элемент
      let closestElement = null;
      let closestDistance = Infinity;
      
      const elementRect = element.getBoundingClientRect();
      
      for (const marker of this.positionMarkers) {
        const markerRect = marker.htmlElement.getBoundingClientRect();
        
        // Проверяем, что маркер находится выше текущего элемента
        if (markerRect.bottom <= elementRect.top) {
          const distance = elementRect.top - markerRect.bottom;
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestElement = marker;
          }
        }
      }
      
      if (closestElement) {
        return {
          position: closestElement.latexPosition,
          type: 'nearest-previous',
          elementType: closestElement.type
        };
      }
    }
    
    // Если не нашли соответствия, но у нас есть секции
    const sections = this.positionMarkers.filter(marker => marker.type === 'section');
    if (sections.length > 0) {
      return {
        position: sections[sections.length - 1].latexPosition,
        type: 'direct-section-match',
        elementType: 'section'
      };
    }
    
    // Если не удалось определить позицию, возвращаем позицию в конце документа
    const documentText = editor.getValue();
    const endDocPosition = documentText.indexOf('\\end{document}');
    
    return {
      position: endDocPosition > -1 ? endDocPosition : documentText.length,
      type: 'document-end',
      elementType: 'document'
    };
  },
  
  /**
   * Находит маркер позиции для заданного HTML элемента
   * @param {HTMLElement} element - HTML элемент
   * @returns {Object|null} - маркер позиции или null, если не найден
   */
  findMarkerForElement: function(element) {
    // Ищем маркер, связанный с этим элементом
    const marker = this.positionMarkers.find(marker => marker.htmlElement === element);
    
    if (marker) {
      return marker;
    }
    
    // Если прямого совпадения не найдено, ищем ближайший подходящий маркер
    // Реализация будет зависеть от конкретных требований
    
    return null;
  }
};

// Делаем объект доступным глобально
window.PDFPositionMapper = PDFPositionMapper;
