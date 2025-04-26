/**
 * Модуль предпросмотра и компиляции
 * Отвечает за компиляцию LaTeX кода и отображение предпросмотра
 */

// Масштаб предпросмотра
let scale = 1.0;

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
  
  // Имитация процесса компиляции с задержкой (для демонстрации)
  setTimeout(() => {
    try {
      // Парсинг LaTeX кода
      const parsedDocument = parseLatexDocument(latexCode);
      
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
  }, 800);
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
  
  // Извлечение содержимого документа
  const bodyMatch = latexCode.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
  document.body = bodyMatch ? bodyMatch[1] : "";
  
  // Извлечение секций
  document.sections = [];
  const sectionRegex = /\\section\{([^}]*)\}([\s\S]*?)(?=\\section\{|\\end\{document\})/g;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(latexCode)) !== null) {
    document.sections.push({
      title: sectionMatch[1],
      content: sectionMatch[2]
    });
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
  
  // Создаем HTML-структуру для предпросмотра
  let html = `
    <div class="pdf-title">${docData.title}</div>
    <div class="pdf-author">${docData.author}</div>
    <div class="pdf-date">${docData.date}</div>
  `;
  
  // Обрабатываем содержимое секций
  if (docData.sections && docData.sections.length > 0) {
    docData.sections.forEach(section => {
      html += `<div class="pdf-section">${section.title}</div>`;
      
      // Заменяем LaTeX-команды на HTML
      let content = section.content;
      
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
        if (paragraph.trim() && !paragraph.includes('<ul') && !paragraph.includes('<ol') && !paragraph.includes('pdf-equation')) {
          html += `<div class="pdf-paragraph">${paragraph.trim()}</div>`;
        } else {
          html += paragraph;
        }
      });
    });
  } else {
    // Если секции не найдены, отображаем основное содержимое
    html += `<div class="pdf-paragraph">${docData.body.trim()}</div>`;
  }
  
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
  }
}

/**
 * Настройка обработчиков событий для предпросмотра
 */
function setupPreviewEvents() {
  // Кнопка компиляции
  const compileBtn = document.getElementById('compile-btn');
  if (compileBtn) {
    compileBtn.addEventListener('click', compileLatex);
  }
  
  // Увеличение масштаба
  const zoomInBtn = document.getElementById('zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      scale += 0.1;
      updateZoom();
    });
  }
  
  // Уменьшение масштаба
  const zoomOutBtn = document.getElementById('zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      if (scale > 0.5) {
        scale -= 0.1;
        updateZoom();
      }
    });
  }
  
  // Загрузка PDF
  const downloadBtn = document.getElementById('download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      alert('PDF файл успешно скомпилирован и готов к скачиванию.\nВ реальном приложении здесь будет загрузка настоящего PDF файла.');
    });
  }
  
  // Справка
  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      alert('Справка по LaTeX:\n\n' + 
        '- Используйте кнопки панели инструментов для вставки типовых элементов\n' +
        '- Нажмите Tab после ввода выражения вида a/b для автоматического преобразования в дробь\n' +
        '- Создавайте собственные умные макросы через меню "Умные макросы"\n' +
        '- В меню "Умные макросы" доступны категории: Математика, Структура, Форматирование и Окружения\n' +
        '- Управляйте файлами через меню "Файлы"\n' +
        '- Настраивайте автокомпиляцию и автосохранение в настройках\n' +
        '- Нажмите Ctrl+Enter для компиляции документа');
    });
  }
}

// Определяем глобальную функцию компиляции для доступа из других модулей
window.compileLatex = compileLatex;
