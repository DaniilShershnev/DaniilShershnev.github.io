/**
 * Модуль управления файлами
 * Отвечает за создание, загрузку, сохранение файлов LaTeX
 */

// Текущий открытый файл
let currentFileName = 'document1.tex';

/**
 * Загрузка списка файлов в модальное окно файлов
 */
function loadFilesList() {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';
  
  // Получаем список файлов из localStorage
  const fileKeys = Object.keys(localStorage).filter(key => key.startsWith('latex-document-'));
  
  // Если нет файлов, создаем первый файл
  if (fileKeys.length === 0) {
    localStorage.setItem('latex-document-' + currentFileName, editor.getValue());
    fileKeys.push('latex-document-' + currentFileName);
  }
  
  // Отображаем файлы
  fileKeys.forEach(key => {
    const fileName = key.replace('latex-document-', '');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    if (fileName === currentFileName) {
      fileItem.classList.add('active');
    }
    
    fileItem.innerHTML = `
      <div>${fileName}</div>
      <div class="file-actions">
        <button class="rename-file" data-name="${fileName}">Переименовать</button>
        <button class="delete-file" data-name="${fileName}">Удалить</button>
      </div>
    `;
    
    // При клике на элемент загружаем файл
    fileItem.addEventListener('click', function(e) {
      // Игнорируем клики на кнопках
      if (e.target.tagName === 'BUTTON') return;
      
      if (fileName !== currentFileName) {
        loadFile(fileName);
      }
    });
    
    fileList.appendChild(fileItem);
  });
  
  // Добавляем обработчики для кнопок
  document.querySelectorAll('.rename-file').forEach(btn => {
    btn.addEventListener('click', function() {
      const oldName = this.getAttribute('data-name');
      const newName = prompt('Введите новое имя файла:', oldName);
      
      if (newName && newName.trim() && newName !== oldName) {
        renameFile(oldName, newName);
      }
    });
  });
  
  document.querySelectorAll('.delete-file').forEach(btn => {
    btn.addEventListener('click', function() {
      const fileName = this.getAttribute('data-name');
      
      if (confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`)) {
        deleteFile(fileName);
      }
    });
  });
}

/**
 * Загрузка файла в редактор
 * @param {string} fileName - имя файла для загрузки
 */
function loadFile(fileName) {
  // Сохраняем текущий файл перед переключением
  if (currentFileName) {
    localStorage.setItem('latex-document-' + currentFileName, editor.getValue());
  }
  
  // Загружаем выбранный файл
  const fileContent = localStorage.getItem('latex-document-' + fileName);
  if (fileContent) {
    editor.setValue(fileContent);
    currentFileName = fileName;
    document.getElementById('current-file').textContent = fileName;
    
    // Обновляем lastSavedContent для правильной работы автосохранения
    lastSavedContent = fileContent;
    
    // Закрываем модальное окно
    document.getElementById('files-modal').style.display = 'none';
    
    // Компилируем загруженный файл
    compileLatex();
  }
}

/**
 * Создание нового файла
 * @param {string} fileName - имя нового файла
 */
function createNewFile(fileName) {
  if (!fileName.trim()) {
    alert('Имя файла не может быть пустым');
    return;
  }
  
  // Добавляем расширение .tex, если его нет
  if (!fileName.endsWith('.tex')) {
    fileName += '.tex';
  }
  
  // Проверяем существование файла
  if (localStorage.getItem('latex-document-' + fileName)) {
    alert(`Файл с именем "${fileName}" уже существует!`);
    return;
  }
  
  // Сохраняем текущий файл
  localStorage.setItem('latex-document-' + currentFileName, editor.getValue());
  
  // Создаем шаблон для нового файла
  const templateContent = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T2A]{fontenc}
\\usepackage[russian]{babel}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{${fileName.replace('.tex', '')}}
\\author{Автор}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Введение}
Содержимое нового файла.

\\end{document}`;
  
  // Сохраняем новый файл
  localStorage.setItem('latex-document-' + fileName, templateContent);
  
  // Загружаем новый файл в редактор
  loadFile(fileName);
  
  // Обновляем список файлов
  loadFilesList();
}

/**
 * Переименование файла
 * @param {string} oldName - текущее имя файла
 * @param {string} newName - новое имя файла
 */
function renameFile(oldName, newName) {
  // Добавляем расширение .tex, если его нет
  if (!newName.endsWith('.tex')) {
    newName += '.tex';
  }
  
  // Проверяем существование файла с новым именем
  if (localStorage.getItem('latex-document-' + newName)) {
    alert(`Файл с именем "${newName}" уже существует!`);
    return;
  }
  
  // Копируем содержимое
  const content = localStorage.getItem('latex-document-' + oldName);
  localStorage.setItem('latex-document-' + newName, content);
  
  // Удаляем старый файл
  localStorage.removeItem('latex-document-' + oldName);
  
  // Если переименовываем текущий файл, обновляем currentFileName
  if (oldName === currentFileName) {
    currentFileName = newName;
    document.getElementById('current-file').textContent = newName;
  }
  
  // Обновляем список файлов
  loadFilesList();
}

/**
 * Удаление файла
 * @param {string} fileName - имя файла для удаления
 */
function deleteFile(fileName) {
  localStorage.removeItem('latex-document-' + fileName);
  
  // Если удаляем текущий файл, загружаем другой
  if (fileName === currentFileName) {
    const fileKeys = Object.keys(localStorage).filter(key => key.startsWith('latex-document-'));
    
    if (fileKeys.length > 0) {
      // Загружаем первый оставшийся файл
      loadFile(fileKeys[0].replace('latex-document-', ''));
    } else {
      // Если файлов не осталось, создаем новый
      const newFileName = 'document1.tex';
      currentFileName = newFileName;
      document.getElementById('current-file').textContent = newFileName;
      
      // Сбрасываем редактор к шаблону
      editor.setValue(`\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T2A]{fontenc}
\\usepackage[russian]{babel}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}

\\title{Новый документ}
\\author{Автор}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Введение}
Содержимое нового документа.

\\end{document}`);
      
      // Сохраняем новый файл
      localStorage.setItem('latex-document-' + newFileName, editor.getValue());
      lastSavedContent = editor.getValue();
    }
  }
  
  // Обновляем список файлов
  loadFilesList();
}

/**
 * Загрузка документа при старте приложения
 */
function loadInitialDocument() {
  // Проверяем, есть ли сохраненные файлы
  const fileKeys = Object.keys(localStorage).filter(key => key.startsWith('latex-document-'));
  if (fileKeys.length > 0) {
    // Загружаем первый файл из списка
    currentFileName = fileKeys[0].replace('latex-document-', '');
    const savedDocument = localStorage.getItem(fileKeys[0]);
    
    if (savedDocument) {
      editor.setValue(savedDocument);
      lastSavedContent = savedDocument;
      document.getElementById('current-file').textContent = currentFileName;
    }
  } else {
    // Если нет сохраненных файлов, сохраняем текущий шаблон
    localStorage.setItem('latex-document-' + currentFileName, editor.getValue());
    lastSavedContent = editor.getValue();
  }
}

/**
 * Настройка обработчиков событий для файлового менеджера
 */
function setupFileManagerEvents() {
  // Открытие модального окна файлов
  document.getElementById('files-btn').addEventListener('click', function() {
    document.getElementById('files-modal').style.display = 'block';
    loadFilesList();
  });
  
  // Создание нового файла
  document.getElementById('create-file-btn').addEventListener('click', function() {
    const fileName = document.getElementById('new-file-name').value.trim();
    if (fileName) {
      createNewFile(fileName);
      document.getElementById('new-file-name').value = '';
    } else {
      alert('Введите имя файла!');
    }
  });
}
