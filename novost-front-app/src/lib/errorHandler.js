/**
 * Utilidades para manejar errores del backend
 * El backend devuelve errores en el formato: { codigo, mensaje, errores: { campo: mensaje } }
 */

/**
 * Extrae el mensaje de error del objeto de error de Axios
 * @param {Object} error - Objeto de error de Axios
 * @returns {Object} - Objeto con el mensaje principal y los errores específicos por campo
 */
export const extractErrorDetails = (error) => {
  // Si no hay respuesta del servidor (error de red, etc.)
  if (!error.response) {
    return {
      message: 'Error de conexión. Por favor verifica tu conexión a internet.',
      errors: {},
      code: 'NETWORK_ERROR'
    };
  }

  const { data } = error.response;

  // Si la respuesta tiene el formato del backend
  if (data && data.mensaje && data.errores) {
    const errors = data.errores;
    
    // Si hay errores específicos por campo, los convertimos a un array para mostrarlos
    const errorMessages = Object.entries(errors).map(([field, message]) => {
      if (field === 'general') {
        return message;
      }
      return `${field}: ${message}`;
    });

    return {
      message: data.mensaje,
      errors: errors,
      errorList: errorMessages,
      code: data.codigo,
      status: data.estado
    };
  }

  // Fallback para respuestas que no siguen el formato esperado
  return {
    message: data?.message || error.message || 'Ha ocurrido un error inesperado',
    errors: {},
    code: 'UNKNOWN_ERROR'
  };
};

/**
 * Genera un mensaje de error formateado para mostrar en toast
 * @param {Object} error - Objeto de error de Axios
 * @returns {string} - Mensaje de error formateado
 */
export const getErrorMessage = (error) => {
  const { errorList, message } = extractErrorDetails(error);
  
  if (errorList && errorList.length > 0) {
    // Si hay múltiples errores, los concatenamos
    if (errorList.length === 1) {
      return errorList[0];
    }
    return errorList.join('\n');
  }
  
  return message;
};

/**
 * Muestra un toast de error usando react-toastify
 * @param {Object} error - Objeto de error de Axios
 * @param {Function} toast - Función toast de react-toastify
 */
export const showErrorToast = (error, toast) => {
  const { errorList, message } = extractErrorDetails(error);
  
  if (errorList && errorList.length > 0) {
    // Si hay errores específicos, los mostramos todos
    errorList.forEach((errMsg) => {
      toast.error(errMsg);
    });
  } else {
    toast.error(message);
  }
};

/**
 * Intenta establecer errores en el estado del formulario
 * Si el backend devuelve errores por campo, los establece en el estado
 * @param {Object} error - Objeto de error de Axios
 * @param {Function} setErrors - Función setErrors del estado del formulario
 */
export const handleFormErrors = (error, setErrors) => {
  const { errors } = extractErrorDetails(error);
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return true;
  }
  
  return false;
};
