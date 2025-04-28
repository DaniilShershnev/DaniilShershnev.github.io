/**
 * Исправленный модуль предпросмотра и компиляции
 * Отвечает за компиляцию LaTeX кода и отображение предпросмотра
 */

// Масштаб предпросмотра


/**
 * Компиляция LaTeX кода
 */
function compileLatex() {
  if (!editor) {
    console.error('Редактор не инициализирован');
    return;
  }

  const latexCode = editor.getValue();
  
  // Показываем индикатор загрузки
  const loadingOverlay = document.querySelector('.loading-overlay');
  const statusElement = document.getElementById('status');
  
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }  
  if (statusElement) {
    statusElement.textContent = "Компиляция...";
  }
  
  // Имитация процесса компиляции с задержкой
  setTimeout(() => {
    try {
      // Парсинг LaTeX кода
      const parsedDocument = parseLatexDocument(latexCode);
      
      // Добавляем флаг для обнаружения TikZ-рисунков
      parsedDocument.hasTikzPictures = latexCode.includes('\\begin{tikzpicture}');
      
      // Обновляем предпросмотр
      renderPdfPreview(parsedDocument);
      
      if (statusElement) {
        statusElement.textContent = "Компиляция завершена";
        setTimeout(() => {
          statusElement.textContent = "Готово";
        }, 2000);
      }
      
    } catch (error) {
      console.error("Ошибка компиляции:", error);
      if (statusElement) {
        statusElement.textContent = "Ошибка компиляции: " + error.message;
      }
    } finally {
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
    }
  }, 500);
}

/**
 * Функция для парсинга LaTeX документа
 * @param {string} latexCode - LaTeX код документа
 * @returns {Object} - объект с данными документа
 */
function parseLatexDocument(latexCode) {
  const document = {};
  
  // Извлечение заголовка
  const titleMatch = latexCode.match(/\\title\{([^}]*)\}/);
  document.title = titleMatch ? titleMatch[1] : "Без названия";
  
  // Извлечение автора
  const authorMatch = latexCode.match(/\\author\{([^}]*)\}/);
  document.author = authorMatch ? authorMatch[1] : "";
  
  // Извлечение даты
  const dateMatch = latexCode.match(/\\date\{([^}]*)\}/);
  document.date = dateMatch ? dateMatch[1] : "\\today";
  if (document.date === "\\today") {
    const today = new Date();
    document.date = today.toLocaleDateString('ru-RU');
  }
  
  // Проверяем наличие пакета TikZ
  const tikzMatch = latexCode.match(/\\usepackage\{tikz\}/);
  if (!tikzMatch && latexCode.includes('\\begin{tikzpicture}')) {
    console.warn('Пакет TikZ не загружен в документе');
    document.warning = 'Для отображения рисунков TikZ, добавьте \\usepackage{tikz} в преамбулу документа';
  }
  
  // Извлечение содержимого документа
  const bodyMatch = latexCode.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
  document.body = bodyMatch ? bodyMatch[1] : "";
  
  // Извлечение секций
  document.sections = [];
  const sectionRegex = /\\section\{([^}]*)\}([\s\S]*?)(?=\\section\{|\\end\{document\})/g;
  let sectionMatch;
  
  let lastIndex = 0;
  while ((sectionMatch = sectionRegex.exec(latexCode)) !== null) {
    document.sections.push({
      title: sectionMatch[1],
      content: sectionMatch[2]
    });
    lastIndex = sectionRegex.lastIndex;
  }
  
  return document;
}

/**
 * Функция для рендеринга предпросмотра PDF
 * @param {Object} docData - объект с данными документа
 */
function renderPdfPreview(docData) {
  const preview = document.getElementById('pdf-preview');
  
  if (!preview) {
    console.error('Элемент pdf-preview не найден');
    return;
  }
  
  // Добавляем специальный класс для документов с TikZ-рисунками
  if (docData.hasTikzPictures) {
    preview.classList.add('has-tikz-pictures');
  } else {
    preview.classList.remove('has-tikz-pictures');
  }
  
  // Создаем HTML-структуру для предпросмотра
  let html = `
    <div class="pdf-title">${docData.title}</div>
    <div class="pdf-author">${docData.author}</div>
    <div class="pdf-date">${docData.date}</div>
  `;
  
  // Показываем предупреждение, если есть
  if (docData.warning) {
    html += `<div style="color: #e74c3c; padding: 10px; margin: 10px 0; border: 1px solid #e74c3c; background-color: #fadbd8; border-radius: 4px;">
      <strong>Внимание:</strong> ${docData.warning}
    </div>`;
  }
  
  // Обрабатываем содержимое секций
  if (docData.sections && docData.sections.length > 0) {
    docData.sections.forEach(section => {
      html += `<div class="pdf-section">${section.title}</div>`;
      
      // Заменяем LaTeX-команды на HTML
      let content = section.content;
      
      // Обработка TikZ рисунков
      content = content.replace(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/g, function(match, tikzCode) {
        // Создаем уникальный идентификатор для канвы
        const canvasId = 'tikz-canvas-' + Math.random().toString(36).substring(2, 15);
        
        // Формируем HTML с канвой для рисунка
        return `
          <div class="pdf-figure">
            <div class="tikz-container">
              <canvas id="${canvasId}" width="500" height="300" style="border:1px solid #ddd; max-width:100%;"></canvas>
            </div>
            <div class="pdf-caption">TikZ-рисунок</div>
          </div>
        `;
      });
      
      // Обработка списков itemize
      content = content.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, function(match, listContent) {
        let listHTML = '<ul class="pdf-list">';
        const itemRegex = /\\item\s+(.*?)(?=\\item|$)/gs;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(listContent)) !== null) {
          listHTML += `<li>${itemMatch[1].trim()}</li>`;
        }
        listHTML += '</ul>';
        return listHTML;
      });
      
      // Обработка списков enumerate
      content = content.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, function(match, listContent) {
        let listHTML = '<ol class="pdf-list">';
        const itemRegex = /\\item\s+(.*?)(?=\\item|$)/gs;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(listContent)) !== null) {
          listHTML += `<li>${itemMatch[1].trim()}</li>`;
        }
        listHTML += '</ol>';
        return listHTML;
      });
      
      // Обработка уравнений
      content = content.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, 
        '<div class="pdf-equation">$1</div>');
      
      // Обработка встроенных формул
      content = content.replace(/\$(.*?)\$/g, '\\($1\\)');
      
      // Разбиваем текст на абзацы
      const paragraphs = content.split('\n\n');
      paragraphs.forEach(paragraph => {
        if (paragraph.trim() && !paragraph.includes('<ul') && !paragraph.includes('<ol') && 
            !paragraph.includes('pdf-equation') && !paragraph.includes('pdf-figure')) {
          html += `<div class="pdf-paragraph">${paragraph.trim()}</div>`;
        } else {
          html += paragraph;
        }
      });
    });
  } else {
    // Если секции не найдены, отображаем основное содержимое
    let content = docData.body.trim();
    
    // Обработка TikZ рисунков
    content = content.replace(/\\begin\{tikzpicture\}([\s\S]*?)\\end\{tikzpicture\}/g, function(match, tikzCode) {
      // Создаем уникальный идентификатор для канвы
      const canvasId = 'tikz-canvas-' + Math.random().toString(36).substring(2, 15);
      
      // Формируем HTML с канвой для рисунка
      return `
        <div class="pdf-figure">
          <div class="tikz-container">
            <canvas id="${canvasId}" width="500" height="300" style="border:1px solid #ddd; max-width:100%;"></canvas>
          </div>
          <div class="pdf-caption">TikZ-рисунок</div>
        </div>
      `;
    });
    
    // Разбиваем основной текст на абзацы
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        html += `<div class="pdf-paragraph">${paragraph.trim()}</div>`;
      }
    });
  }
  
  // Устанавливаем HTML
  preview.innerHTML = html;
  
  // Запускаем MathJax для рендеринга формул
  if (typeof MathJax !== 'undefined') {
    MathJax.typesetPromise([preview]).catch(function (err) {
      console.error('MathJax ошибка:', err);
    });
  }
}

/**
 * Обновляет масштаб предпросмотра
 */
function updateZoom() {
  const preview = document.getElementById('pdf-preview');
  if (preview) {
    preview.style.transform = `scale(${scale})`;
    preview.style.transformOrigin = 'top center';
  }
}

// Определяем глобальную функцию компиляции для доступа из других модулей
window.compileLatex = compileLatex;
window.parseLatexDocument = parseLatexDocument;
window.renderPdfPreview = renderPdfPreview;
window.updateZoom = updateZoom;
