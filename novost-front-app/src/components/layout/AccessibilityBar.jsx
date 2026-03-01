import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, EyeOff, Type, RefreshCw } from 'lucide-react';

const AccessibilityBar = () => {
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [isTextOnly, setIsTextOnly] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale}%`;
  }, [fontSizeScale]);

  useEffect(() => {
    if (isTextOnly) {
      document.body.classList.add('text-only-mode');
    } else {
      document.body.classList.remove('text-only-mode');
    }
  }, [isTextOnly]);

  const increaseFont = () => setFontSizeScale(prev => Math.min(prev + 10, 170));
  const decreaseFont = () => setFontSizeScale(prev => Math.max(prev - 10, 60));
  const toggleTextOnly = () => setIsTextOnly(prev => !prev);
  
  // Función para volver todo a la normalidad
  const resetDefaults = () => {
    setFontSizeScale(100);
    setIsTextOnly(false);
  };

  return (
    <div className="accessibility-bar" aria-label="Herramientas de accesibilidad">
      <div className="acc-item">
        <button onClick={decreaseFont} aria-label="Reducir tamaño de letra">
          <ZoomOut size={24} />
        </button>
        <span className="acc-tooltip">Reducir Letra</span>
      </div>
      
      <div className="acc-item">
        <button onClick={increaseFont} aria-label="Aumentar tamaño de letra">
          <ZoomIn size={24} />
        </button>
        <span className="acc-tooltip">Aumentar Letra</span>
      </div>
      
      <div className="acc-item">
        <button 
          onClick={toggleTextOnly} 
          className={isTextOnly ? "active-mode" : ""}
          aria-label="Alternar modo solo texto"
        >
          {isTextOnly ? <Type size={24} /> : <EyeOff size={24} />}
        </button>
        <span className="acc-tooltip">Solo Texto</span>
      </div>

      <div className="acc-item">
        <button onClick={resetDefaults} className="reset-btn" aria-label="Reestablecer predeterminados">
          <RefreshCw size={24} />
        </button>
        <span className="acc-tooltip">Reestablecer predeterminados</span>
      </div>
    </div>
  );
};

export default AccessibilityBar;