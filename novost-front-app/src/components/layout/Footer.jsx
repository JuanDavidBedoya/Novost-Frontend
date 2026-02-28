import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <h3>Novost</h3>
          <p>La elegancia y la mejor comida en un solo lugar. Creando experiencias gastronómicas inolvidables para nuestros clientes más exigentes.</p>
          <div className="social-icons">
            <a href="#!"><Facebook size={20} /></a>
            <a href="#!"><Instagram size={20} /></a>
            <a href="#!"><Twitter size={20} /></a>
          </div>
        </div>

        <div className="footer-section links">
          <h4>Enlaces Legales</h4>
          <Link to="/terminos">Términos y Condiciones</Link>
        </div>

        <div className="footer-section contact">
          <h4>Desarrollado por:</h4>
          <p><strong>Juan David Bedoya Sánchez</strong></p>
          <a href="mailto:juand.bedoyas@uqvirtual.edu.co">juand.bedoyas@uqvirtual.edu.co</a>
          <br /><br />
          <p><strong>Juan Steban Martínez Bermúdez</strong></p>
          <a href="mailto:juans.martinezb@uqvirtual.edu.co">juans.martinezb@uqvirtual.edu.co</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Novost Restaurante. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;