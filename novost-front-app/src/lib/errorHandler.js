export const extractErrorDetails = (error) => {
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

export const handleFormErrors = (error, setErrors) => {
  const { errors } = extractErrorDetails(error);
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return true;
  }
  
  return false;
};
