import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import {
  Plus, Search, X, Upload,
  ChevronDown, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../../api/apiConfig';
import { toast } from 'react-toastify';
import './GestionMenu.css';

const IMAGEN_DEFAULT = '/imagen-por-defecto.jpg';
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const GestionMenu = () => {
  const [platos, setPlatos]           = useState([]);
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

  // ── Estado del formulario ──
  const [form, setForm] = useState({
    nombrePlato: '', descripcion: '',
    precioPlato: '', idCategoria: '', imagenUrl: ''
  });
  const [imagenPreview, setImagenPreview]     = useState(null);
  const [subiendoImagen, setSubiendoImagen]   = useState(false);
  const [ingredientes, setIngredientes]       = useState([]);
  const [busqueda, setBusqueda]               = useState('');
  const [resultados, setResultados]           = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [guardando, setGuardando]             = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { cargarDatos(); }, []);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const cerrar = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, []);

  // Búsqueda de ingredientes con debounce
  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      setMostrarDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/platos/ingredientes?q=${busqueda}`);
        setResultados(res.data);
        setMostrarDropdown(true);
      } catch {
        console.error('Error buscando ingredientes');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const cargarDatos = async () => {
    try {
      const [resPlatos, resCategorias] = await Promise.all([
        api.get('/platos/admin/todos'),
        api.get('/platos/categorias')
      ]);
      setPlatos(resPlatos.data);
      setCategorias(resCategorias.data);
    } catch {
      toast.error('Error al cargar los datos del menú.');
    } finally {
      setLoading(false);
    }
  };

  const subirImagenCloudinary = async (archivo) => {
    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append('file', archivo);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST', body: fd
      });
      const data = await res.json();
      setForm(prev => ({ ...prev, imagenUrl: data.secure_url }));
      setImagenPreview(data.secure_url);
      toast.success('Imagen subida correctamente.');
    } catch {
      toast.error('No se pudo subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagenPreview(ev.target.result);
    reader.readAsDataURL(archivo);
    subirImagenCloudinary(archivo);
  };

  const agregarIngrediente = (item) => {
    if (ingredientes.find(i => i.idAlimento === item.idAlimento)) {
      toast.warning('Este ingrediente ya fue agregado.');
      return;
    }
    setIngredientes(prev => [...prev, {
      idAlimento: item.idAlimento,
      nombreAlimento: item.nombreAlimento,
      cantidadNecesaria: '',
      tipoMedida: item.tipoMedida
    }]);
    setBusqueda('');
    setMostrarDropdown(false);
  };

  const actualizarCantidad = (idAlimento, valor) => {
    setIngredientes(prev =>
      prev.map(i => i.idAlimento === idAlimento ? { ...i, cantidadNecesaria: valor } : i)
    );
  };

  const eliminarIngrediente = (idAlimento) => {
    setIngredientes(prev => prev.filter(i => i.idAlimento !== idAlimento));
  };

  const toggleHabilitado = async (idPlato, estadoActual) => {
    try {
      await api.put(`/platos/${idPlato}/habilitar`);
      setPlatos(prev => prev.map(p =>
        p.idPlato === idPlato ? { ...p, habilitadoAdmin: !estadoActual } : p
      ));
      toast.success(`Plato ${estadoActual ? 'deshabilitado' : 'habilitado'} correctamente.`);
    } catch {
      toast.error('No se pudo actualizar el estado del plato.');
    }
  };

  const resetForm = () => {
    setForm({ nombrePlato: '', descripcion: '', precioPlato: '', idCategoria: '', imagenUrl: '' });
    setImagenPreview(null);
    setIngredientes([]);
    setBusqueda('');
  };

  const handleCrearPlato = async (e) => {
    e.preventDefault();

    if (!form.imagenUrl) {
      toast.error('Debes subir una imagen para el plato.');
      return;
    }

    if (ingredientes.length === 0) {
      toast.error('El plato debe tener al menos un ingrediente.');
      return;
    }
    
    if (ingredientes.some(i => !i.cantidadNecesaria || Number(i.cantidadNecesaria) <= 0)) {
      toast.error('Todos los ingredientes deben tener una cantidad válida.');
      return;
    }

    const payload = {
      nombrePlato:  form.nombrePlato,
      descripcion:  form.descripcion,
      precioPlato:  parseFloat(form.precioPlato),
      idCategoria:  parseInt(form.idCategoria),
      imagenUrl:    form.imagenUrl,
      ingredientes: ingredientes.map(i => ({
        idAlimento:       i.idAlimento,
        cantidadNecesaria: parseFloat(i.cantidadNecesaria)
      }))
    };

    setGuardando(true);
    try {
      await api.post('/platos', payload);
      toast.success('¡Plato creado exitosamente!');
      setModalAbierto(false);
      resetForm();
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al crear el plato.');
    } finally {
      setGuardando(false);
    }
  };

  const platosFiltrados = categoriaFiltro === 'Todos'
    ? platos
    : platos.filter(p => p.categoriaNombre === categoriaFiltro);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(v);

  if (loading) return <div className="gestion-loading"><h2>Cargando menú...</h2></div>;

  return (
    <div className="gestion-menu-page">
      <Helmet><title>Novost — Gestión del Menú</title></Helmet>

      {/* Header */}
      <div className="gestion-header">
        <div>
          <h1>Gestión del Menú</h1>
          <p>Administra los platos del restaurante</p>
        </div>
        <button className="btn-crear-plato" onClick={() => setModalAbierto(true)}>
          <Plus size={18} /> Agregar Plato
        </button>
      </div>

      {/* Filtros */}
      <div className="gestion-filtros">
        {['Todos', ...categorias.map(c => c.nombreCategoria)].map(cat => (
          <button
            key={cat}
            className={`filtro-btn ${categoriaFiltro === cat ? 'active' : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="gestion-platos-grid">
        {platosFiltrados.map(plato => (
          <div
            key={plato.idPlato}
            className={`gestion-plato-card ${!plato.habilitadoAdmin ? 'deshabilitado' : ''}`}
          >
            <div className="gestion-plato-img-wrapper">
              <img
                src={plato.imagenUrl || IMAGEN_DEFAULT}
                alt={plato.nombrePlato}
                className="gestion-plato-img"
                onError={(e) => { e.target.onerror = null; e.target.src = IMAGEN_DEFAULT; }}
              />
              {!plato.habilitadoAdmin && (
                <div className="badge-deshabilitado">Deshabilitado</div>
              )}
              {!plato.disponibleStock && plato.habilitadoAdmin && (
                <div className="badge-sin-stock">Sin stock</div>
              )}
            </div>
            <div className="gestion-plato-info">
              <span className="gestion-plato-categoria">{plato.categoriaNombre}</span>
              <h3>{plato.nombrePlato}</h3>
              <p>{plato.descripcion}</p>
              <div className="gestion-plato-footer">
                <span className="gestion-plato-precio">{formatCurrency(plato.precioPlato)}</span>
                <button
                  className={`btn-toggle ${plato.habilitadoAdmin ? 'habilitado' : 'deshabilitado'}`}
                  onClick={() => toggleHabilitado(plato.idPlato, plato.habilitadoAdmin)}
                  title={plato.habilitadoAdmin ? 'Deshabilitar plato' : 'Habilitar plato'}
                >
                  {plato.habilitadoAdmin
                    ? <><ToggleRight size={18} /> Habilitado</>
                    : <><ToggleLeft size={18} /> Deshabilitado</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear plato */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => { setModalAbierto(false); resetForm(); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Plato</h2>
              <button className="modal-close" onClick={() => { setModalAbierto(false); resetForm(); }}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCrearPlato}>

              {/* Imagen */}
              <div className="form-group">
                <label>Imagen del Plato</label>
                <div
                  className="imagen-upload-area"
                  onClick={() => document.getElementById('inputImagen').click()}
                >
                  {imagenPreview
                    ? <img src={imagenPreview} alt="Preview" className="imagen-preview" />
                    : (
                      <div className="imagen-placeholder">
                        <Upload size={32} color="#B452FF" />
                        <span>{subiendoImagen ? 'Subiendo imagen...' : 'Haz clic para subir una imagen'}</span>
                      </div>
                    )
                  }
                </div>
                <input
                  id="inputImagen"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImagenChange}
                />
              </div>

              {/* Nombre */}
              <div className="form-group">
                <label>Nombre del Plato</label>
                <input
                  type="text"
                  className="gestion-input"
                  placeholder="Ej: Lomo al trapo"
                  value={form.nombrePlato}
                  onChange={e => setForm(prev => ({ ...prev, nombrePlato: e.target.value }))}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="gestion-input gestion-textarea"
                  placeholder="Breve descripción del plato..."
                  value={form.descripcion}
                  onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Precio + Categoría */}
              <div className="form-row">
                <div className="form-group">
                  <label>Precio (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="gestion-input"
                    placeholder="0.00"
                    value={form.precioPlato}
                    onChange={e => setForm(prev => ({ ...prev, precioPlato: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <div className="select-wrapper">
                    <select
                      className="gestion-input"
                      value={form.idCategoria}
                      onChange={e => setForm(prev => ({ ...prev, idCategoria: e.target.value }))}
                      required
                    >
                      <option value="">— Selecciona —</option>
                      {categorias.map(cat => (
                        <option key={cat.idCategoria} value={cat.idCategoria}>
                          {cat.nombreCategoria}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="select-icon" />
                  </div>
                </div>
              </div>

              {/* Ingredientes */}
              <div className="form-group">
                <label>Ingredientes (Receta)</label>
                <div className="ingrediente-search-wrapper" ref={dropdownRef}>
                  <div className="ingrediente-search-input">
                    <Search size={16} color="#9ca3af" />
                    <input
                      type="text"
                      placeholder="Buscar ingrediente por nombre..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      onFocus={() => resultados.length > 0 && setMostrarDropdown(true)}
                    />
                  </div>
                  {mostrarDropdown && resultados.length > 0 && (
                    <div className="ingrediente-dropdown">
                      {resultados.map(item => (
                        <div
                          key={item.idAlimento}
                          className="ingrediente-option"
                          onMouseDown={() => agregarIngrediente(item)}
                        >
                          <span>{item.nombreAlimento}</span>
                          <span className="ingrediente-medida">{item.tipoMedida}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {ingredientes.length > 0 && (
                  <div className="ingredientes-lista">
                    {ingredientes.map(ing => (
                      <div key={ing.idAlimento} className="ingrediente-item">
                        <span className="ingrediente-nombre">{ing.nombreAlimento}</span>
                        <div className="ingrediente-cantidad-wrapper">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="ingrediente-cantidad-input"
                            placeholder="Cant."
                            value={ing.cantidadNecesaria}
                            onChange={e => actualizarCantidad(ing.idAlimento, e.target.value)}
                          />
                          <span className="ingrediente-unidad">{ing.tipoMedida}</span>
                        </div>
                        <button
                          type="button"
                          className="btn-eliminar-ingrediente"
                          onClick={() => eliminarIngrediente(ing.idAlimento)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => { setModalAbierto(false); resetForm(); }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={guardando || subiendoImagen}
                >
                  {guardando ? 'Guardando...' : 'Crear Plato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMenu;