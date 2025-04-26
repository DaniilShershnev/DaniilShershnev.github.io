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
  
  // Делаем настройки доступными глобально для других модулей
  window.settings = settings;
}

/**
 * Применение настроек к интерфейсу
 */
function applySettings() {
  // Применяем размер шрифта
  const cmElement = document.querySelector('.CodeMirror');
  if (cmElement) {
    cmElement.style.fontSize = settings.fontSize + 'px';
  }
  
  // Обновляем элементы формы
  const autosaveToggle = document.getElementById('autosave-toggle');
  if (autosaveToggle) {
    autosaveToggle.checked = settings.autoSaveEnabled;
  }
  
  const autocompileToggle = document.getElementById('autocompile-toggle');
  if (autocompileToggle) {
    autocompileToggle.checked = settings.autoCompileEnabled;
  }
  
  const autosaveInterval = document.getElementById('autosave-interval');
  if (autosaveInterval) {
    autosaveInterval.value = settings.autoSaveInterval;
  }
  
  const autocompileDelay = document.getElementById('autocompile-delay');
  if (autocompileDelay) {
    autocompileDelay.value = settings.autoCompileDelay;
  }
  
  const fontSize = document.getElementById('font-size');
  if (fontSize) {
    fontSize.value = settings.fontSize;
  }
}

/**
 * Сохранение настроек в localStorage
 */
function saveSettings() {
  localStorage.setItem('latex-editor-settings', JSON.stringify(settings));
  
  // Обновляем глобальные настройки
  window.settings = settings;
}

/**
 * Настройка обработчиков событий для настроек
 */
function setupSettingsEvents() {
  // Открытие модального окна настроек
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      const modal = document.getElementById('settings-modal');
      if (modal) {
        modal.style.display = 'block';
        applySettings();
      }
    });
  }
  
  // Переключатель автосохранения
  const autosaveToggle = document.getElementById('autosave-toggle');
  if (autosaveToggle) {
    autosaveToggle.addEventListener('change', function() {
      settings.autoSaveEnabled = this.checked;
      saveSettings();
    });
  }
  
  // Переключатель автокомпиляции
  const autocompileToggle = document.getElementById('autocompile-toggle');
  if (autocompileToggle) {
    autocompileToggle.addEventListener('change', function() {
      settings.autoCompileEnabled = this.checked;
      saveSettings();
    });
  }
  
  // Интервал автосохранения
  const autosaveInterval = document.getElementById('autosave-interval');
  if (autosaveInterval) {
    autosaveInterval.addEventListener('change', function() {
      const value = parseInt(this.value);
      if (value >= 1 && value <= 30) {
        settings.autoSaveInterval = value;
        saveSettings();
      }
    });
  }
  
  // Задержка автокомпиляции
  const autocompileDelay = document.getElementById('autocompile-delay');
  if (autocompileDelay) {
    autocompileDelay.addEventListener('change', function() {
      const value = parseInt(this.value);
      if (value >= 1 && value <= 10) {
        settings.autoCompileDelay = value;
        saveSettings();
      }
    });
  }
  
  // Размер шрифта
  const fontSize = document.getElementById('font-size');
  if (fontSize) {
    fontSize.addEventListener('change', function() {
      settings.fontSize = parseInt(this.value);
      const cmElement = document.querySelector('.CodeMirror');
      if (cmElement) {
        cmElement.style.fontSize = settings.fontSize + 'px';
      }
      saveSettings();
    });
  }
}
