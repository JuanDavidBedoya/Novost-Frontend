import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, EyeOff, Type, RefreshCw, Contrast } from 'lucide-react';

const AccessibilityBar = () => {
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [isTextOnly, setIsTextOnly] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false); // Nuevo estado

  // Efecto para tamaño de letra
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeScale}%`;
  }, [fontSizeScale]);

  // Efecto para modo solo texto
  useEffect(() => {
    if (isTextOnly) {
      document.body.classList.add('text-only-mode');
    } else {
      document.body.classList.remove('text-only-mode');
    }
  }, [isTextOnly]);

  // Efecto para modo alto contraste
  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [isHighContrast]);

  const increaseFont = () => setFontSizeScale(prev => Math.min(prev + 10, 170));
  const decreaseFont = () => setFontSizeScale(prev => Math.max(prev - 10, 60));
  const toggleTextOnly = () => setIsTextOnly(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev); // Nueva función
  
  // Función para volver todo a la normalidad
  const resetDefaults = () => {
    setFontSizeScale(100);
    setIsTextOnly(false);
    setIsHighContrast(false); // Reseteamos también el contraste
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

      {/* Nuevo botón de Alto Contraste */}
      <div className="acc-item">
        <button 
          onClick={toggleHighContrast} 
          className={isHighContrast ? "active-mode" : ""}
          aria-label="Alternar alto contraste"
        >
          <Contrast size={24} />
        </button>
        <span className="acc-tooltip">Alto Contraste</span>
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