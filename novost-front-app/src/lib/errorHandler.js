  // Funciones auxiliares para extraer, formatear y mostrar errores de la API

export const extractErrorDetails = (error) => {

  // Función extractErrorDetails: extrae detalles del error de respuesta y estructura la información

  if (!error.response) {
    return {
      message: 'Error de conexión. Por favor verifica tu conexión a internet.',
      errors: {},
      code: 'NETWORK_ERROR'
    };
  }

  const { data } = error.response;

  if (data && data.mensaje && data.errores) {
    const errors = data.errores;
    
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

  return {
    message: data?.message || error.message || 'Ha ocurrido un error inesperado',
    errors: {},
    code: 'UNKNOWN_ERROR'
  };
};

// Función getErrorMessage: retorna mensaje de error formateado para mostrar al usuario

export const getErrorMessage = (error) => {
  const { errorList, message } = extractErrorDetails(error);
  
  if (errorList && errorList.length > 0) {
    if (errorList.length === 1) {
      return errorList[0];
    }
    return errorList.join('\n');
  }
  
  return message;
};

// Función showErrorToast: muestra errores en notificaciones toast (una por cada error o general)

export const showErrorToast = (error, toast) => {
  const { errorList, message } = extractErrorDetails(error);
  
  if (errorList && errorList.length > 0) {
    errorList.forEach((errMsg) => {
      toast.error(errMsg);
    });
  } else {
    toast.error(message);
  }
};

// Función handleFormErrors: extrae y asigna errores de validación al estado del formulario

export const handleFormErrors = (error, setErrors) => {
  const { errors } = extractErrorDetails(error);
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return true;
  }
  
  return false;
};
