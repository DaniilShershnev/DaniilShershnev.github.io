/**
 * Модуль редактора кода LaTeX
 * Отвечает за инициализацию и работу с редактором CodeMirror
 */

// Глобальная переменная для доступа к экземпляру редактора
let editor;

// Дополнительные переменные для работы с редактором
let autoSaveTimer = null;
let autoCompileTimer = null;
let isTyping = false;
let lastTypingTime = 0;
let lastSavedContent = '';

/**
 * Инициализирует редактор CodeMirror
 */
function initEditor() {
  const editorElement = document.getElementById('editor');
  
  if (!editorElement) {
    console.error('Элемент editor не найден');
    return;
  }
  
  try {
    editor = CodeMirror.fromTextArea(editorElement, {
      mode: "stex",
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      autofocus: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      extraKeys: {
        "Ctrl-Enter": function() { 
          if (typeof compileLatex === 'function') {
            compileLatex(); 
          } else {
            console.error('Функция compileLatex не определена');
          }
        },
        "Tab": function(cm) {
          // Пытаемся применить умные макросы
          if (typeof applySmartMacros === 'function' && applySmartMacros(cm)) {
            // Если макрос применен, ничего больше не делаем
          } else {
            // Если ни один макрос не применен, вставляем обычный таб
            cm.replaceSelection("  ");
          }
        }
      }
    });
    
    // Применяем размер шрифта из настроек
    applyFontSize();
    
    // Устанавливаем обработчики событий
    setupEditorEvents();
    
    console.log('Редактор успешно инициализирован');
  } catch (error) {
    console.error('Ошибка инициализации редактора:', error);
  }
}

/**
 * Применяет размер шрифта из настроек к редактору
 */
function applyFontSize() {
  if (!editor) return;
  
  const cmElement = document.querySelector('.CodeMirror');
  if (cmElement && settings && settings.fontSize) {
    cmElement.style.fontSize = settings.fontSize + 'px';
  }
}

/**
 * Устанавливает обработчики событий для редактора
 */
function setupEditorEvents() {
  if (!editor) return;
  
  // Обновление позиции курсора
  editor.on("cursorActivity", function() {
    const cursor = editor.getCursor();
    const posElement = document.getElementById('cursor-position');
    if (posElement) {
      posElement.textContent = `Строка: ${cursor.line + 1}, Столбец: ${cursor.ch + 1}`;
    }
  });
  
  // Событие изменения содержимого редактора
  editor.on("change", function() {
    // Отметим, что пользователь печатает
    isTyping = true;
    lastTypingTime = Date.now();
    
    // Отменяем предыдущие таймеры
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (autoCompileTimer) clearTimeout(autoCompileTimer);
    
    // Проверяем, определены ли настройки
    if (typeof settings === 'undefined') {
      console.warn('settings не определены');
      return;
    }
    
    // Создаем новый таймер для автосохранения
    if (settings.autoSaveEnabled) {
      autoSaveTimer = setTimeout(function() {
        autoSave();
      }, settings.autoSaveInterval * 1000);
    }
    
    // Создаем новый таймер для автокомпиляции
    if (settings.autoCompileEnabled) {
      autoCompileTimer = setTimeout(function() {
        if (typeof compileLatex === 'function') {
          compileLatex();
        }
      }, settings.autoCompileDelay * 1000);
    }
  });
}

/**
 * Функция автосохранения
 */
function autoSave() {
  if (!isTyping || !editor) return;
  
  const content = editor.getValue();
  if (content === lastSavedContent) return;
  
  // Проверяем, определена ли переменная currentFileName
  if (typeof currentFileName === 'undefined') {
    console.warn('currentFileName не определена');
    return;
  }
  
  // Сохраняем в localStorage
  localStorage.setItem('latex-document-' + currentFileName, content);
  lastSavedContent = content;
  
  // Показываем индикатор автосохранения
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) {
    indicator.classList.add('show');
    indicator.textContent = 'Автосохранение...';
    
    // Скрываем индикатор через 2 секунды
    setTimeout(function() {
      indicator.classList.remove('show');
    }, 2000);
  }
  
  isTyping = false;
}

/**
 * Вставляет шаблон в редактор
 * @param {string} template - шаблон для вставки
 */
function insertTemplate(template) {
  if (!editor) return;
  
  const cursor = editor.getCursor();
  editor.replaceRange(template, cursor);
  
  // Устанавливаем курсор внутри вставленного шаблона
  if (template.includes('{}')) {
    const newPosition = {
      line: cursor.line,
      ch: cursor.ch + template.indexOf('{}') + 1
    };
    editor.setCursor(newPosition);
  } else if (template.includes('\n')) {
    const lines = template.split('\n');
    const newPosition = {
      line: cursor.line + 1,
      ch: lines[1].length
    };
    editor.setCursor(newPosition);
  }
  
  editor.focus();
}

/**
 * Устанавливает обработчики событий для кнопок панели инструментов
 */
function setupToolbarButtons() {
  document.querySelectorAll('.toolbar button[data-insert]').forEach(button => {
    button.addEventListener('click', function() {
      const template = this.getAttribute('data-insert');
      insertTemplate(template);
    });
  });
}

/**
 * Обновляет статусную строку
 * @param {string} message - сообщение для отображения
 * @param {number} [timeout] - время в мс, через которое статус вернется к "Готово"
 */
function updateStatus(message, timeout = 2000) {
  const statusElement = document.getElementById('status');
  
  if (statusElement) {
    statusElement.textContent = message;
    
    if (timeout) {
      setTimeout(() => {
        statusElement.textContent = "Готово";
      }, timeout);
    }
  }
}

// Экспортируем функцию updateStatus для использования из других модулей
window.updateStatus = updateStatus;
