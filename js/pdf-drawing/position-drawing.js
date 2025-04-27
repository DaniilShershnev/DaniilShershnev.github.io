type: 'direct-section-match',
          elementType: 'section'
        };
      }
    }
    
    // Если не удалось определить позицию, возвращаем позицию в конце документа
    const documentText = editor.getValue();
    const endDocPosition = documentText.indexOf('\\end{document}');
    
    return {
      position: endDocPosition > -1 ? endDocPosition : documentText.length,
      type: 'document-end',
      elementType: 'document'
    };
  },
  
  /**
   * Находит маркер позиции для заданного HTML элемента
   * @param {HTMLElement} element - HTML элемент
   * @returns {Object|null} - маркер позиции или null, если не найден
   */
  findMarkerForElement: function(element) {
    // Ищем маркер, связанный с этим элементом
    const marker = this.positionMarkers.find(marker => marker.htmlElement === element);
    
    if (marker) {
      return marker;
    }
    
    // Если прямого совпадения не найдено, ищем ближайший подходящий маркер
    // Реализация будет зависеть от конкретных требований
    
    return null;
  }
};

// Делаем объект доступным глобально
window.PDFPositionMapper = PDFPositionMapper;
