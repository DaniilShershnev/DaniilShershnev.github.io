/**
 * Модуль загрузки изображений
 * Отвечает за загрузку и вставку изображений в LaTeX документ
 */

// Массив для хранения загруженных изображений
let uploadedImages = [];

/**
 * Инициализирует функциональность загрузки изображений
 */
function initImageFunctionality() {
  // Инициализируем загрузку изображений
  initImageUpload();
  
  // Модифицируем компилятор
  enhanceCompilerForImages();
}

/**
 * Инициализирует функциональность загрузки изображений
 */
function initImageUpload() {
  // Проверяем, существует ли модальное окно изображений
  if (!document.getElementById('image-upload-modal')) {
    createImageUploadModal();
  }
  
  // Устанавливаем обработчики событий
  setupImageUploadEvents();
  
  // Загружаем ранее сохраненные изображения из localStorage (если есть)
  loadSavedImages();
}

/**
 * Создает модальное окно для загрузки изображений
 */
function createImageUploadModal() {
  // Создаем элемент модального окна
  const modal = document.createElement('div');
  modal.id = 'image-upload-modal';
  modal.className = 'modal';
  
  // Создаем содержимое модального окна
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Загрузка изображения</h2>
      
      <div class="image-upload-container">
        <div class="form-group">
          <label for="image-file">Выберите изображение:</label>
          <input type="file" id="image-file" accept="image/*">
        </div>
        
        <div class="form-group">
          <label for="image-label">Подпись изображения:</label>
          <input type="text" id="image-label" placeholder="Подпись (опционально)">
        </div>
        
        <div class="form-group">
          <label for="image-width">Ширина изображения:</label>
          <select id="image-width">
            <option value="0.3">30% ширины страницы</option>
            <option value="0.5">50% ширины страницы</option>
            <option value="0.7">70% ширины страницы</option>
            <option value="0.8" selected>80% ширины страницы</option>
            <option value="1.0">100% ширины страницы</option>
          </select>
        </div>
        
        <div id="image-preview-container" style="display: none; margin-top: 15px;">
          <h3>Предпросмотр:</h3>
          <div id="image-preview" style="max-width: 100%; max-height: 300px; border: 1px solid #ddd; padding: 5px; text-align: center;"></div>
        </div>
        
        <div class="form-group" style="margin-top: 20px;">
          <button id="upload-image-btn" class="primary-btn" disabled>Вставить изображение</button>
        </div>
      </div>
      
      <div class="uploaded-images-container" style="margin-top: 20px; display: none;">
        <h3>Ранее загруженные изображения:</h3>
        <div id="uploaded-images-list" class="file-list"></div>
      </div>
    </div>
  `;
  
  // Добавляем модальное окно в документ
  document.body.appendChild(modal);
}

/**
 * Устанавливает обработчики событий для загрузки изображений
 */
function setupImageUploadEvents() {
  // Закрытие модального окна
  const closeBtn = document.querySelector('#image-upload-modal .close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      document.getElementById('image-upload-modal').style.display = 'none';
    });
  }
  
  // Обработка выбора файла
  const fileInput = document.getElementById('image-file');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Показываем предпросмотр
        const previewContainer = document.getElementById('image-preview-container');
        const preview = document.getElementById('image-preview');
        const reader = new FileReader();
        
        reader.onload = function(e) {
          preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 250px;">`;
          previewContainer.style.display = 'block';
          document.getElementById('upload-image-btn').disabled = false;
        };
        
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Кнопка вставки изображения
  const uploadBtn = document.getElementById('upload-image-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function() {
      insertImageToDocument();
    });
  }
  
  // Кнопка открытия модального окна
  const imageBtn = document.getElementById('image-btn');
  if (imageBtn) {
    imageBtn.addEventListener('click', function() {
      document.getElementById('image-upload-modal').style.display = 'block';
      displayUploadedImages();
    });
  }
}

/**
 * Вставляет изображение в документ
 */
function insertImageToDocument() {
  const fileInput = document.getElementById('image-file');
  if (!fileInput.files.length) return;
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const imageData = e.target.result;
    const label = document.getElementById('image-label').value || 'Рисунок';
    const width = document.getElementById('image-width').value;
    
    // Генерируем уникальное имя файла
    const fileName = `img_${Date.now()}_${file.name}`;
    
    // Сохраняем изображение
    saveImageToStorage(fileName, imageData, label);
    
    // Добавляем в LaTeX документ
    const figureCode = `\\begin{figure}[h]
  \\centering
  \\includegraphics[width=${width}\\textwidth]{${fileName}}
  \\caption{${label}}
  \\label{fig:${fileName.replace(/\s+/g, '_')}}
\\end{figure}`;
    
    // Вставляем в текущую позицию курсора
    const cursor = editor.getCursor();
    editor.replaceRange(figureCode, cursor);
    
    // Закрываем модальное окно
    document.getElementById('image-upload-modal').style.display = 'none';
    
    // Обновляем статус
    updateStatus('Изображение вставлено');
    
    // Очищаем форму
    fileInput.value = '';
    document.getElementById('image-label').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('upload-image-btn').disabled = true;
    
    // Компилируем документ (если автокомпиляция включена)
    if (settings.autoCompileEnabled) {
      compileLatex();
    }
  };
  
  reader.readAsDataURL(file);
}

/**
 * Сохраняет изображение в localStorage
 * @param {string} fileName - имя файла
 * @param {string} imageData - данные изображения (Data URL)
 * @param {string} label - подпись изображения
 */
function saveImageToStorage(fileName, imageData, label) {
  // Добавляем новое изображение в массив
  uploadedImages.push({
    name: fileName,
    data: imageData,
    label: label,
    date: new Date().toLocaleString()
  });
  
  // Сохраняем только метаданные в localStorage (без самих изображений, чтобы не переполнить хранилище)
  const imagesMeta = uploadedImages.map(img => ({
    name: img.name,
    label: img.label,
    date: img.date
  }));
  
  localStorage.setItem('latex-images-meta', JSON.stringify(imagesMeta));
  
  // Сохраняем само изображение отдельно
  localStorage.setItem(`latex-image-${fileName}`, imageData);
}

/**
 * Загружает сохраненные изображения из localStorage
 */
function loadSavedImages() {
  const imagesMeta = localStorage.getItem('latex-images-meta');
  if (imagesMeta) {
    try {
      const meta = JSON.parse(imagesMeta);
      
      // Загружаем метаданные
      uploadedImages = meta.map(img => ({
        name: img.name,
        label: img.label,
        date: img.date,
        data: localStorage.getItem(`latex-image-${img.name}`) || ''
      })).filter(img => img.data); // Исключаем изображения, данные которых не найдены
      
    } catch (e) {
      console.error('Ошибка загрузки изображений:', e);
      uploadedImages = [];
    }
  }
}

/**
 * Отображает список загруженных изображений
 */
function displayUploadedImages() {
  const container = document.querySelector('.uploaded-images-container');
  const list = document.getElementById('uploaded-images-list');
  
  if (!container || !list) return;
  
  if (uploadedImages.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  list.innerHTML = '';
  
  uploadedImages.forEach(img => {
    const item = document.createElement('div');
    item.className = 'file-item';
    
    item.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="${img.data}" style="max-width: 50px; max-height: 30px; margin-right: 10px;">
        <div>
          <div>${img.label || 'Без подписи'}</div>
          <div style="font-size: 12px; color: #777;">${img.name} (${img.date})</div>
        </div>
      </div>
      <div class="file-actions">
        <button class="insert-saved-image" data-name="${img.name}">Вставить</button>
        <button class="delete-image" data-name="${img.name}">Удалить</button>
      </div>
    `;
    
    list.appendChild(item);
  });
  
  // Обработчики событий для кнопок
  document.querySelectorAll('.insert-saved-image').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = this.getAttribute('data-name');
      insertSavedImage(name);
    });
  });
  
  document.querySelectorAll('.delete-image').forEach(btn => {
    btn.addEventListener('click', function() {
      const name = this.getAttribute('data-name');
      deleteImage(name);
    });
  });
}

/**
 * Вставляет сохраненное изображение в документ
 * @param {string} name - имя файла
 */
function insertSavedImage(name) {
  const image = uploadedImages.find(img => img.name === name);
  if (!image) return;
  
  const width = document.getElementById('image-width').value;
  
  const figureCode = `\\begin{figure}[h]
  \\centering
  \\includegraphics[width=${width}\\textwidth]{${image.name}}
  \\caption{${image.label || 'Рисунок'}}
  \\label{fig:${image.name.replace(/\s+/g, '_')}}
\\end{figure}`;
  
  // Вставляем в текущую позицию курсора
  const cursor = editor.getCursor();
  editor.replaceRange(figureCode, cursor);
  
  // Закрываем модальное окно
  document.getElementById('image-upload-modal').style.display = 'none';
  
  // Обновляем статус
  updateStatus('Изображение вставлено');
  
  // Компилируем документ (если автокомпиляция включена)
  if (settings.autoCompileEnabled) {
    compileLatex();
  }
}

/**
 * Удаляет изображение
 * @param {string} name - имя файла
 */
function deleteImage(name) {
  if (!confirm(`Вы уверены, что хотите удалить изображение "${name}"?`)) return;
  
  // Удаляем из массива
  uploadedImages = uploadedImages.filter(img => img.name !== name);
  
  // Удаляем из localStorage
  localStorage.removeItem(`latex-image-${name}`);
  
  // Обновляем метаданные
  const imagesMeta = uploadedImages.map(img => ({
    name: img.name,
    label: img.label,
    date: img.date
  }));
  
  localStorage.setItem('latex-images-meta', JSON.stringify(imagesMeta));
  
  // Обновляем список изображений
  displayUploadedImages();
  
  // Обновляем статус
  updateStatus('Изображение удалено');
}

/**
 * Модифицирует компилятор для обработки изображений при предпросмотре
 */
function enhanceCompilerForImages() {
  // Сохраняем оригинальную функцию компиляции
  const originalCompileLatex = window.compileLatex;
  
  // Перезаписываем функцию компиляции
  window.compileLatex = function() {
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
  };
  
  // Модифицируем функцию рендеринга, чтобы добавить поддержку изображений
  window.renderPdfPreview = function(docData) {
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
        
        // Обработка изображений
        content = content.replace(/\\begin\{figure\}[\s\S]*?\\includegraphics\[width=([^\]]*?)\\textwidth\]\{([^\}]*?)\}[\s\S]*?\\caption\{([^\}]*?)\}[\s\S]*?\\end\{figure\}/g, function(match, width, imageName, caption) {
          // Ищем изображение в сохраненных
          const image = uploadedImages.find(img => img.name === imageName);
          if (image && image.data) {
            return `<div class="pdf-figure">
              <img src="${image.data}" style="max-width: ${parseFloat(width) * 100}%; margin: 10px 0;">
              <div class="pdf-caption">Рис.: ${caption}</div>
            </div>`;
          } else {
            return `<div class="pdf-figure">
              <div style="border: 1px dashed #ccc; padding: 20px; text-align: center; color: #999;">
                Изображение "${imageName}" не найдено
              </div>
              <div class="pdf-caption">Рис.: ${caption}</div>
            </div>`;
          }
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
      html += `<div class="pdf-paragraph">${docData.body.trim()}</div>`;
    }
    
    preview.innerHTML = html;
    
    // Запускаем MathJax для рендеринга формул
    if (typeof MathJax !== 'undefined') {
      MathJax.typesetPromise([preview]).catch(function (err) {
        console.error('MathJax ошибка:', err);
      });
    }
  };
}

/**
 * Добавляет кнопку для загрузки изображений на панель инструментов
 */
function addImageButton() {
  // Проверяем, существует ли уже кнопка
  if (document.getElementById('image-btn')) return;
  
  // Получаем панель инструментов
  const toolbar = document.querySelector('.editor-pane .toolbar');
  if (!toolbar) return;
  
  // Создаем кнопку
  const imageButton = document.createElement('button');
  imageButton.id = 'image-btn';
  imageButton.textContent = 'Изображение';
  imageButton.title = 'Загрузить изображение';
  
  // Находим кнопку "Рисунок", после которой вставим нашу
  const figureButton = Array.from(toolbar.querySelectorAll('button')).find(btn => 
    btn.getAttribute('data-insert') && btn.getAttribute('data-insert').includes('\\begin{figure}')
  );
  
  if (figureButton) {
    toolbar.insertBefore(imageButton, figureButton.nextSibling);
    
    // Инициализируем функционал
    initImageFunctionality();
  } else {
    // Если кнопка не найдена, добавляем в конец
    toolbar.appendChild(imageButton);
    
    // Инициализируем функционал
    initImageFunctionality();
  }
}

// Вызываем функцию инициализации после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
  // Добавляем кнопку для изображений
  addImageButton();
});
