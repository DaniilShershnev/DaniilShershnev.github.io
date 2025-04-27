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
  
  // Проверяем наличие пакета TikZ
  const tikzMatch = latexCode.match(/\\usepackage\{tikz\}/);
  if (!tikzMatch && latexCode.includes('\\begin{tikzpicture}')) {
    console.warn('Пакет TikZ не загружен в документе');
    // Если пакет не загружен, добавляем предупреждение
    document.warning = 'Для отображения рисунков TikZ, добавьте \\usepackage{tikz} в преамбулу документа';
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
        const html = `
          <div class="pdf-figure">
            <div class="tikz-container">
              <canvas id="${canvasId}" width="500" height="300" style="border:1px solid #ddd; max-width:100%;"></canvas>
            </div>
            <div class="pdf-caption">TikZ-рисунок</div>
          </div>
        `;
        
        // Добавляем функцию для рендеринга рисунка после загрузки страницы
        setTimeout(() => {
          // Получаем канву и ее контекст
          const canvas = document.getElementById(canvasId);
          if (!canvas) return;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Очищаем канву
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Устанавливаем белый фон
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Масштабируем и центрируем координаты
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(30, 30); // Масштаб для TikZ координат
          
          // Рисуем основные фигуры из TikZ-кода
          drawTikzToCanvas(ctx, tikzCode);
        }, 100);
        
        return html;
      });
      
      // Обработка изображений
      content = content.replace(/\\begin\{figure\}[\s\S]*?\\includegraphics\[width=([^\]]*?)\\textwidth\]\{([^\}]*?)\}[\s\S]*?\\caption\{([^\}]*?)\}[\s\S]*?\\end\{figure\}/g, function(match, width, imageName, caption) {
        // Ищем изображение в сохраненных
        if (typeof uploadedImages !== 'undefined') {
          const image = uploadedImages.find(img => img.name === imageName);
          if (image && image.data) {
            return `<div class="pdf-figure">
              <img src="${image.data}" style="max-width: ${parseFloat(width) * 100}%; margin: 10px 0;">
              <div class="pdf-caption">Рис.: ${caption}</div>
            </div>`;
          }
        }
        
        return `<div class="pdf-figure">
          <div style="border: 1px dashed #ccc; padding: 20px; text-align: center; color: #999;">
            Изображение "${imageName}" не найдено
          </div>
          <div class="pdf-caption">Рис.: ${caption}</div>
        </div>`;
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
      const html = `
        <div class="pdf-figure">
          <div class="tikz-container">
            <canvas id="${canvasId}" width="500" height="300" style="border:1px solid #ddd; max-width:100%;"></canvas>
          </div>
          <div class="pdf-caption">TikZ-рисунок</div>
        </div>
      `;
      
      // Добавляем функцию для рендеринга рисунка после загрузки страницы
      setTimeout(() => {
        // Получаем канву и ее контекст
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Очищаем канву
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Устанавливаем белый фон
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Масштабируем и центрируем координаты
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(30, 30); // Масштаб для TikZ координат
        
        // Рисуем основные фигуры из TikZ-кода
        drawTikzToCanvas(ctx, tikzCode);
      }, 100);
      
      return html;
    });
    
    html += `<div class="pdf-paragraph">${content}</div>`;
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
 * Функция для рисования TikZ команд на канве
 * @param {CanvasRenderingContext2D} ctx - контекст канвы для рисования
 * @param {string} tikzCode - код TikZ
 */
function drawTikzToCanvas(ctx, tikzCode) {
  // Ищем команды рисования в TikZ-коде
  const drawCommands = tikzCode.match(/\\draw\[[^\]]*\][^;]+;/g) || [];
  
  drawCommands.forEach(command => {
    // Получаем атрибуты команды
    const attributes = command.match(/\\draw\[([^\]]*)\]/);
    const attributesStr = attributes ? attributes[1] : '';
    
    // Устанавливаем цвет
    let color = 'black';
    const colorMatch = attributesStr.match(/color=\{rgb,255:red,(\d+);green,(\d+);blue,(\d+)\}/);
    if (colorMatch) {
      color = `rgb(${colorMatch[1]}, ${colorMatch[2]}, ${colorMatch[3]})`;
    }
    
    // Устанавливаем толщину линии
    let lineWidth = 2;
    const lineWidthMatch = attributesStr.match(/line width=(\d+)pt/);
    if (lineWidthMatch) {
      lineWidth = parseFloat(lineWidthMatch[1]) / 10;
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Обработка эллипса
    const ellipseMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*ellipse\s*\((-?[\d\.]+)\s*and\s*(-?[\d\.]+)\)/);
    if (ellipseMatch) {
      const centerX = parseFloat(ellipseMatch[1]);
      const centerY = parseFloat(ellipseMatch[2]);
      const radiusX = parseFloat(ellipseMatch[3]);
      const radiusY = parseFloat(ellipseMatch[4]);
      
      ctx.beginPath();
      ctx.ellipse(centerX, -centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      return;
    }
    
    // Обработка линий
    const lineMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*--\s*\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
    if (lineMatch) {
      const x1 = parseFloat(lineMatch[1]);
      const y1 = parseFloat(lineMatch[2]);
      const x2 = parseFloat(lineMatch[3]);
      const y2 = parseFloat(lineMatch[4]);
      
      ctx.beginPath();
      ctx.moveTo(x1, -y1);
      ctx.lineTo(x2, -y2);
      ctx.stroke();
      return;
    }
    
    // Обработка прямоугольников
    const rectMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*rectangle\s*\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
    if (rectMatch) {
      const x1 = parseFloat(rectMatch[1]);
      const y1 = parseFloat(rectMatch[2]);
      const x2 = parseFloat(rectMatch[3]);
      const y2 = parseFloat(rectMatch[4]);
      
      ctx.beginPath();
      ctx.rect(x1, -y1, x2 - x1, -(y2 - y1));
      ctx.stroke();
      return;
    }
    
    // Обработка стрелок
    if (attributesStr.includes('->,')) {
      const arrowMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)\s*--\s*\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
      if (arrowMatch) {
        const x1 = parseFloat(arrowMatch[1]);
        const y1 = parseFloat(arrowMatch[2]);
        const x2 = parseFloat(arrowMatch[3]);
        const y2 = parseFloat(arrowMatch[4]);
        
        // Рисуем линию
        ctx.beginPath();
        ctx.moveTo(x1, -y1);
        ctx.lineTo(x2, -y2);
        ctx.stroke();
        
        // Рисуем наконечник стрелки
        const angle = Math.atan2(-(y2 - y1), x2 - x1);
        const headLength = lineWidth * 4;
        
        ctx.beginPath();
        ctx.moveTo(x2, -y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          -y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          -y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        return;
      }
    }
    
    // Обработка свободной формы (path)
    const pathMatch = command.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)((?:\s*--\s*\([-\d\.]+,\s*[-\d\.]+\))+)/);
    if (pathMatch) {
      const startX = parseFloat(pathMatch[1]);
      const startY = parseFloat(pathMatch[2]);
      const pathStr = pathMatch[3];
      
      const points = pathStr.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)/g) || [];
      
      ctx.beginPath();
      ctx.moveTo(startX, -startY);
      
      points.forEach(point => {
        const coords = point.match(/\((-?[\d\.]+),\s*(-?[\d\.]+)\)/);
        if (coords) {
          const x = parseFloat(coords[1]);
          const y = parseFloat(coords[2]);
          ctx.lineTo(x, -y);
        }
      });
      
      ctx.stroke();
    }
  });
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
        '- Для создания рисунка используйте кнопку "Рисование" или введите "\\draw" и нажмите Tab\n' +
        '- Нажмите Ctrl+Enter для компиляции документа');
    });
  }
  // Диспетчеризация событий компиляции
  const originalCompileLatex = compileLatex;
  compileLatex = function() {
    // Генерируем событие перед компиляцией
    document.dispatchEvent(new CustomEvent('before-latex-compile'));
    
    // Вызываем оригинальную функцию компиляции
    const result = originalCompileLatex.apply(this, arguments);
    
    // После небольшой задержки, диспетчеризируем событие завершения компиляции
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('after-latex-compile'));
    }, 1000); // Задержка для завершения рендеринга
    
    return result;
}

// Определяем глобальную функцию компиляции для доступа из других модулей
window.compileLatex = compileLatex;
