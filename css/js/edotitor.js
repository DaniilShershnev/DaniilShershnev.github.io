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
  editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: "stex",
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    autofocus: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: {
      "Ctrl-Enter": function() { compileLatex(); },
      "Tab": function(cm) {
        // Пытаемся применить умные макросы
        if (!applySmartMacros(cm)) {
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
}

/**
 * Применяет размер шрифта из настроек к редактору
 */
function applyFontSize() {
  document.querySelector('.CodeMirror').style.fontSize = settings.fontSize + 'px';
}

/**
 * Устанавливает обработчики событий для редактора
 */
function setupEditorEvents() {
  // Обновление позиции курсора
  editor.on("cursorActivity", function() {
    const cursor = editor.getCursor();
    document.getElementById('cursor-position').textContent = `Строка: ${cursor.line + 1}, Столбец: ${cursor.ch + 1}`;
  });
  
  // Событие изменения содержимого редактора
  editor.on("change", function() {
    // Отметим, что пользователь печатает
    isTyping = true;
    lastTypingTime = Date.now();
    
    // Отменяем предыдущие таймеры
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (autoCompileTimer) clearTimeout(autoCompileTimer);
    
    // Создаем новый таймер для автосохранения
    if (settings.autoSaveEnabled) {
      autoSaveTimer = setTimeout(function() {
        autoSave();
      }, settings.autoSaveInterval * 1000);
    }
    
    // Создаем новый таймер для автокомпиляции
    if (settings.autoCompileEnabled) {
      autoCompileTimer = setTimeout(function() {
        compileLatex();
      }, settings.autoCompileDelay * 1000);
    }
  });
}

/**
 * Функция автосохранения
 */
function autoSave() {
  if (!isTyping) return;
  
  const content = editor.getValue();
  if (content === lastSavedContent) return;
  
  // Сохраняем в localStorage
  localStorage.setItem('latex-document-' + currentFileName, content);
  lastSavedContent = content;
  
  // Показываем индикатор автосохранения
  const indicator = document.getElementById('autosave-indicator');
  indicator.classList.add('show');
  indicator.textContent = 'Автосохранение...';
  
  // Скрываем индикатор через 2 секунды
  setTimeout(function() {
    indicator.classList.remove('show');
  }, 2000);
  
  isTyping = false;
}

/**
 * Вставляет шаблон в редактор
 * @param {string} template - шаблон для вставки
 */
function insertTemplate(template) {
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
