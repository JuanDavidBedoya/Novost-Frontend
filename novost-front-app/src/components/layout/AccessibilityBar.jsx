import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, EyeOff, Type, RefreshCw, Contrast, User } from 'lucide-react';

const AccessibilityBar = () => {
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [isTextOnly, setIsTextOnly] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  
  const resetDefaults = () => {
    setFontSizeScale(100);
    setIsTextOnly(false);
    setIsHighContrast(false);
  };

  const toggleBar = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="accessibility-container" aria-label="Herramientas de accesibilidad">
      {/* Botón de accesibilidad cuando está cerrado */}
      {!isOpen && (
        <button 
          className="accessibility-toggle-btn"
          onClick={toggleBar}
          aria-label="Abrir opciones de accesibilidad"
        >
          <User size={24} />
          <span>Accesibilidad</span>
        </button>
      )}

      {/* Barra completa de accesibilidad cuando está abierto */}
      {isOpen && (
        <div className="accessibility-bar">
          <div className="acc-header">
            <button 
              className="acc-close-btn"
              onClick={toggleBar}
              aria-label="Cerrar opciones de accesibilidad">
              <User size={20} />
            </button>
            <span className="acc-tooltip">Cerrar Accesibilidad</span>
          </div>
          
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
      )}
    </div>
  );
};

export default AccessibilityBar;
