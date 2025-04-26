/**
 * Модуль настроек
 * Управляет настройками редактора и их сохранением
 */

// Настройки по умолчанию
let settings = {
  autoCompileEnabled: false,
  autoSaveEnabled: true,
  autoCompileDelay: 2, // в секундах
  autoSaveInterval: 3, // в секундах
  fontSize: 14 // в пикселях
};

/**
 * Загрузка настроек из localStorage
 */
function loadSettings() {
  if (localStorage.getItem('latex-editor-settings')) {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('latex-editor-settings'));
      settings = { ...settings, ...savedSettings };
    } catch (e) {
      console.error('Ошибка при загрузке настроек:', e);
      // Если произошла ошибка, используем настройки по умолчанию
      localStorage.setItem('latex-editor-settings', JSON.stringify(settings));
    }
  } else {
    // Если настроек нет, сохраняем настройки по умолчанию
    localStorage.setItem('latex-editor-settings', JSON.stringify(settings));
  }
}

/**
 * Применение настроек к интерфейсу
 */
function applySettings() {
  // Применяем размер шрифта
  document.querySelector('.CodeMirror').style.fontSize = settings.fontSize + 'px';
  
  // Обновляем элементы формы
  document.getElementById('autosave-toggle').checked = settings.autoSaveEnabled;
  document.getElementById('autocompile-toggle').checked = settings.autoCompileEnabled;
  document.getElementById('autosave-interval').value = settings.autoSaveInterval;
  document.getElementById('autocompile-delay').value = settings.autoCompileDelay;
  document.getElementById('font-size').value = settings.fontSize;
}

/**
 * Сохранение настроек в localStorage
 */
function saveSettings() {
  localStorage.setItem('latex-editor-settings', JSON.stringify(settings));
}

/**
 * Настройка обработчиков событий для настроек
 */
function setupSettingsEvents() {
  // Открытие модального окна настроек
  document.getElementById('settings-btn').addEventListener('click', function() {
    document.getElementById('settings-modal').style.display = 'block';
    applySettings();
  });
  
  // Переключатель автосохранения
  document.getElementById('autosave-toggle').addEventListener('change', function() {
    settings.autoSaveEnabled = this.checked;
    saveSettings();
  });
  
  // Переключатель автокомпиляции
  document.getElementById('autocompile-toggle').addEventListener('change', function() {
    settings.autoCompileEnabled = this.checked;
    saveSettings();
  });
  
  // Интервал автосохранения
  document.getElementById('autosave-interval').addEventListener('change', function() {
    const value = parseInt(this.value);
    if (value >= 1 && value <= 30) {
      settings.autoSaveInterval = value;
      saveSettings();
    }
  });
  
  // Задержка автокомпиляции
  document.getElementById('autocompile-delay').addEventListener('change', function() {
    const value = parseInt(this.value);
    if (value >= 1 && value <= 10) {
      settings.autoCompileDelay = value;
      saveSettings();
    }
  });
  
  // Размер шрифта
  document.getElementById('font-size').addEventListener('change', function() {
    settings.fontSize = parseInt(this.value);
    document.querySelector('.CodeMirror').style.fontSize = settings.fontSize + 'px';
    saveSettings();
  });
}
