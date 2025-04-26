/* Стили для редактора рисования */

/* Модальное окно редактора рисования */
.drawing-modal-content {
  width: 80%;
  max-width: 900px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  flex-direction: column;
}

/* Панель инструментов */
.drawing-toolbar {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
  flex-wrap: wrap;
  gap: 10px;
}

/* Группы инструментов */
.drawing-tools-group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  padding-right: 15px;
  border-right: 1px solid #ddd;
}

.drawing-settings-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  padding-left: 15px;
}

/* Кнопки инструментов */
.drawing-tool {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.drawing-tool:hover {
  background-color: #e0e0e0;
}

.drawing-tool.active {
  background-color: #3498db;
  color: white;
  border-color: #2980b9;
}

.drawing-tool.active svg path {
  fill: white;
}

.drawing-tool svg {
  width: 24px;
  height: 24px;
}

.drawing-tool svg path {
  fill: #333;
}

/* Опции инструментов */
.tool-option {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tool-option label {
  font-size: 14px;
  margin-bottom: 3px;
}

/* Контейнер для canvas */
.drawing-canvas-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  margin: 10px 0;
}

/* Canvas для рисования */
#drawing-canvas {
  cursor: crosshair;
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Кнопки действий */
.drawing-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 0;
}

/* Кнопки */
.primary-btn {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #2980b9;
}

.secondary-btn {
  background-color: #e0e0e0;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.secondary-btn:hover {
  background-color: #d0d0d0;
}

.secondary-btn svg path {
  fill: #333;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .drawing-modal-content {
    width: 95%;
    height: 90vh;
  }
  
  .drawing-toolbar {
    flex-direction: column;
  }
  
  .drawing-tools-group {
    border-right: none;
    border-bottom: 1px solid #ddd;
    padding-right: 0;
    padding-bottom: 10px;
  }
  
  .drawing-settings-group {
    padding-left: 0;
    padding-top: 10px;
  }
}
