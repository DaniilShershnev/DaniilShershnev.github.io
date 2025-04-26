/**
 * Модуль умных макросов
 * Обеспечивает работу с умными макросами LaTeX
 */

// Умные макросы
let smartMacros = [
  {
    pattern: '([^\\s/]+)/([^\\s/]+)',
    template: '\\frac{$1}{$2}'
  }
];

/**
 * Загрузка сохраненных умных макросов из localStorage
 */
function loadSmartMacros() {
  if (localStorage.getItem('latex-smart-macros')) {
    try {
      smartMacros = JSON.parse(localStorage.getItem('latex-smart-macros'));
    } catch (e) {
      console.error('Ошибка при загрузке умных макросов:', e);
      // Устанавливаем стандартные макросы
      smartMacros = [
        {
          pattern: '([^\\s/]+)/([^\\s/]+)',
          template: '\\frac{$1}{$2}'
        }
      ];
      localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
    }
  } else {
    localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
  }
}

/**
 * Функция применения умных макросов
 * @param {CodeMirror} cm - экземпляр редактора CodeMirror
 * @returns {boolean} - true если макрос был применен, false в противном случае
 */
function applySmartMacros(cm) {
  // Текущая позиция курсора
  const cursor = cm.getCursor();
  const line = cm.getLine(cursor.line);
  const textBeforeCursor = line.substring(0, cursor.ch);
  
  // Проверяем специальное кодовое слово для редактора рисования
  if (textBeforeCursor.trim() === "\\draw") {
    // Удаляем кодовое слово
    const startPos = {
      line: cursor.line,
      ch: textBeforeCursor.indexOf("\\draw")
    };
    cm.replaceRange("", startPos, cursor);
    
    // Открываем редактор рисования
    openDrawingEditor();
    
    // Обновляем статус
    updateStatus('Открыт редактор рисования');
    
    return true;
  }
  
  // Попытка применить умные макросы
  for (const smartMacro of smartMacros) {
    try {
      const regex = new RegExp(smartMacro.pattern);
      const match = textBeforeCursor.match(regex);
      
      if (match && match.index !== undefined) {
        // Определяем начальную позицию совпадения
        const startPos = {
          line: cursor.line,
          ch: match.index
        };
        
        // Создаем замену, подставляя захваченные группы
        let replacement = smartMacro.template;
        for (let i = 1; i < match.length; i++) {
          const placeholder = `$${i}`;
          replacement = replacement.replace(new RegExp('\\' + placeholder, 'g'), match[i]);
        }
        
        // Заменяем текст
        cm.replaceRange(replacement, startPos, cursor);
        
        // Обновляем статус
        updateStatus('Применен умный макрос');
        
        // Анимируем индикатор применения макроса
        showMacroAppliedAnimation(cm, startPos, replacement);
        
        return true; // Макрос успешно применен
      }
    } catch (e) {
      console.error('Ошибка при применении умного макроса:', e);
    }
  }
  
  return false; // Ни один макрос не применился
}

/**
 * Показать анимацию применения макроса
 * @param {CodeMirror} cm - экземпляр редактора CodeMirror
 * @param {Object} startPos - начальная позиция замены
 * @param {string} replacement - строка замены
 */
function showMacroAppliedAnimation(cm, startPos, replacement) {
  // Создаем временный маркер на месте замены
  const marker = document.createElement('div');
  marker.className = 'macro-applied-marker';
  marker.style.position = 'absolute';
  marker.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
  marker.style.borderRadius = '2px';
  marker.style.transition = 'opacity 1s';
  marker.style.pointerEvents = 'none';
  
  // Определяем координаты и размеры маркера
  const startCoords = cm.charCoords(startPos, 'local');
  const endCoords = cm.charCoords(cm.getCursor(), 'local');
  
  marker.style.left = startCoords.left + 'px';
  marker.style.top = startCoords.top + 'px';
  marker.style.width = (endCoords.left - startCoords.left) + 'px';
  marker.style.height = (endCoords.bottom - startCoords.top) + 'px';
  
  // Добавляем маркер к редактору
  const wrapper = cm.getWrapperElement();
  wrapper.appendChild(marker);
  
  // Анимация исчезновения
  setTimeout(() => {
    marker.style.opacity = '0';
    setTimeout(() => {
      wrapper.removeChild(marker);
    }, 1000);
  }, 500);
}

/**
 * Функция обновления списка умных макросов в интерфейсе
 */
function updateSmartMacrosList() {
  const smartMacrosList = document.getElementById('smart-macros-list');
  const emptyMessage = document.getElementById('empty-user-macros');
  
  if (!smartMacrosList) return;
  
  smartMacrosList.innerHTML = '';
  
  if (smartMacros.length === 0) {
    if (emptyMessage) emptyMessage.style.display = 'block';
    return;
  }
  
  if (emptyMessage) emptyMessage.style.display = 'none';
  
  smartMacros.forEach((macro, index) => {
    const macroItem = document.createElement('div');
    macroItem.className = 'macro-item';
    
    // Создаем пример для визуализации
    let patternExample = macro.pattern;
    try {
      // Попытка упростить регулярное выражение для удобочитаемости
      patternExample = macro.pattern
        .replace(/\\\\/g, '\\')
        .replace(/\(\[\^\\\\s\/\]\+\)/g, 'a')
        .replace(/\(\[\^\\\\s\^\]\+\)/g, 'a')
        .replace(/\(\.\*\)/g, 'текст');
    } catch (e) {
      console.error('Ошибка при создании примера:', e);
    }
    
    macroItem.innerHTML = `
      <div class="macro-info">
        <div class="macro-pattern">${patternExample}</div>
        <div class="macro-arrow">→</div>
        <div class="macro-result">${macro.template.replace(/\n/g, '↵')}</div>
      </div>
      <div>
        <button class="delete-smart-macro" data-index="${index}">Удалить</button>
      </div>
    `;
    
    smartMacrosList.appendChild(macroItem);
  });
  
  // Добавляем обработчики событий для кнопок удаления
  document.querySelectorAll('.delete-smart-macro').forEach(button => {
    button.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      smartMacros.splice(index, 1);
      localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
      updateSmartMacrosList();
    });
  });
}

/**
 * Настройка предустановленных макросов
 */
function setupPredefinedMacros() {
  document.querySelectorAll('.add-predefined-macro').forEach(button => {
    button.addEventListener('click', function() {
      const pattern = this.getAttribute('data-pattern');
      const template = this.getAttribute('data-template');
      
      // Проверяем, не существует ли уже такой макрос
      const existingMacro = smartMacros.find(macro => macro.pattern === pattern);
      if (existingMacro) {
        alert('Этот макрос уже добавлен в ваш список.');
        return;
      }
      
      // Добавляем новый макрос
      smartMacros.push({
        pattern: pattern,
        template: template
      });
      
      // Сохраняем в localStorage
      localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
      
      // Обновляем список и переключаемся на вкладку пользовательских макросов
      updateSmartMacrosList();
      switchTab('user-macros');
      
      // Изменяем текст кнопки на "Добавлено"
      const originalText = this.textContent;
      this.textContent = "Добавлено ✓";
      this.disabled = true;
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
      }, 2000);
    });
  });
}

/**
 * Функция переключения вкладок в модальном окне умных макросов
 * @param {string} tabId - идентификатор вкладки
 */
function switchTab(tabId) {
  // Деактивируем все вкладки
  document.querySelectorAll('.macro-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.macro-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Активируем выбранную вкладку
  document.querySelector(`.macro-tab-btn[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).style.display = 'block';
  
  // Если выбрана вкладка пользовательских макросов, обновляем список
  if (tabId === 'user-macros') {
    updateSmartMacrosList();
  }
}

/**
 * Настройка переключения вкладок в модальном окне умных макросов
 */
function setupTabSwitching() {
  document.querySelectorAll('.macro-tab-btn').forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

/**
 * Обновляет предпросмотр умного макроса в форме создания
 */
function updateSmartMacroPreview() {
  const pattern = document.getElementById('smart-macro-pattern').value;
  const template = document.getElementById('smart-macro-template').value;
  
  if (pattern && template) {
    try {
      // Создаем более понятный пример для предпросмотра
      let exampleBefore = pattern;
      
      // Заменяем общие шаблоны регулярных выражений на конкретные примеры
      exampleBefore = exampleBefore
        .replace(/\\\\/g, '\\')
        .replace(/\(\[\^\\\\s\/\]\+\)/g, 'a1')
        .replace(/\(\[\^\\\\s\^\]\+\)/g, 'a1')
        .replace(/\(\.\*\)/g, 'текст');
      
      // Имитируем замену для предпросмотра
      let exampleAfter = template;
      try {
        // Заменяем все плейсхолдеры $1, $2 на соответствующие значения
        exampleAfter = exampleAfter.replace(/\$1/g, 'a1');
        exampleAfter = exampleAfter.replace(/\$2/g, 'b1');
      } catch (e) {
        console.error('Ошибка при предпросмотре:', e);
      }
      
      // Обновляем элементы предпросмотра
      document.getElementById('smart-macro-before').textContent = exampleBefore;
      document.getElementById('smart-macro-after').textContent = exampleAfter;
    } catch (e) {
      console.error('Ошибка обновления предпросмотра:', e);
    }
  }
}

/**
 * Добавляет кнопки экспорта/импорта на страницу умных макросов
 */
function addExportImportButtons() {
  const macrosContent = document.getElementById('user-macros');
  if (!macrosContent) return;
  
  // Проверяем, не добавлены ли уже кнопки
  if (document.getElementById('export-macros-btn')) return;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'space-between';
  buttonContainer.style.marginTop = '15px';
  
  // Кнопка экспорта
  const exportBtn = document.createElement('button');
  exportBtn.id = 'export-macros-btn';
  exportBtn.innerText = 'Экспорт макросов';
  exportBtn.className = 'primary-btn';
  exportBtn.addEventListener('click', exportMacros);
  
  // Кнопка импорта
  const importBtn = document.createElement('button');
  importBtn.id = 'import-macros-btn';
  importBtn.innerText = 'Импорт макросов';
  importBtn.className = 'primary-btn';
  importBtn.addEventListener('click', importMacros);
  
  buttonContainer.appendChild(exportBtn);
  buttonContainer.appendChild(importBtn);
  macrosContent.appendChild(buttonContainer);
}

/**
 * Экспорт макросов в JSON-файл
 */
function exportMacros() {
  const macrosJSON = JSON.stringify(smartMacros, null, 2);
  
  // Создаем элемент для скачивания
  const blob = new Blob([macrosJSON], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'latex-smart-macros.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Импорт макросов из JSON-файла
 */
function importMacros() {
  // Создаем скрытый input для загрузки файла
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const importedMacros = JSON.parse(event.target.result);
        
        if (Array.isArray(importedMacros)) {
          // Спрашиваем пользователя о способе импорта
          const importMode = confirm('Заменить существующие макросы импортированными? Нажмите "OK" для замены или "Отмена" для добавления к существующим.');
          
          if (importMode) {
            // Заменяем все макросы
            smartMacros = importedMacros;
          } else {
            // Добавляем только новые макросы
            importedMacros.forEach(newMacro => {
              if (!macroExists(newMacro.pattern)) {
                smartMacros.push(newMacro);
              }
            });
          }
          
          // Сохраняем и обновляем интерфейс
          localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
          updateSmartMacrosList();
          
          alert(`Импортировано успешно: ${importedMacros.length} макросов.`);
        } else {
          alert('Ошибка: неверный формат файла. Ожидается массив макросов.');
        }
      } catch (e) {
        console.error('Ошибка при импорте макросов:', e);
        alert('Ошибка при импорте файла. Убедитесь, что файл содержит корректный JSON.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

/**
 * Проверка существования макроса по шаблону
 * @param {string} pattern - шаблон макроса
 * @returns {boolean} - true если макрос существует, false в противном случае
 */
function macroExists(pattern) {
  return smartMacros.some(macro => macro.pattern === pattern);
}

/**
 * Настройка обработчиков событий для модального окна умных макросов
 */
function setupSmartMacrosEvents() {
  // Открытие модального окна
  document.getElementById('smart-macros-btn').addEventListener('click', function() {
    const modal = document.getElementById('smart-macros-modal');
    if (modal) {
      modal.style.display = 'block';
      switchTab('user-macros');
      setupPredefinedMacros();
      setupTabSwitching();
      addExportImportButtons();
    }
  });
  
  // Обработчики для полей создания умных макросов
  document.getElementById('smart-macro-pattern').addEventListener('input', updateSmartMacroPreview);
  document.getElementById('smart-macro-template').addEventListener('input', updateSmartMacroPreview);
  
  // Кнопка добавления пользовательского макроса
  document.getElementById('add-smart-macro-btn').addEventListener('click', function() {
    const pattern = document.getElementById('smart-macro-pattern').value.trim();
    const template = document.getElementById('smart-macro-template').value.trim();
    
    if (!pattern || !template) {
      alert('Пожалуйста, заполните оба поля.');
      return;
    }
    
    // Проверка валидности регулярного выражения
    try {
      new RegExp(pattern);
    } catch (e) {
      alert('Ошибка в шаблоне. Пожалуйста, проверьте корректность регулярного выражения.');
      return;
    }
    
    // Проверяем, не существует ли уже такой макрос
    const existingMacroIndex = smartMacros.findIndex(macro => macro.pattern === pattern);
    if (existingMacroIndex >= 0) {
      if (confirm('Макрос с таким шаблоном уже существует. Хотите заменить его?')) {
        smartMacros[existingMacroIndex].template = template;
      } else {
        return;
      }
    } else {
      // Добавляем новый умный макрос
      smartMacros.push({
        pattern: pattern,
        template: template
      });
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('latex-smart-macros', JSON.stringify(smartMacros));
    
    // Очищаем поля формы
    document.getElementById('smart-macro-pattern').value = '';
    document.getElementById('smart-macro-template').value = '';
    
    // Обновляем список и переключаемся на вкладку пользовательских макросов
    updateSmartMacrosList();
    switchTab('user-macros');
    
    // Уведомляем пользователя
    updateStatus('Умный макрос добавлен', 3000);
  });
}
