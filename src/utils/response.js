const response = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    message,
    payload: data,
    metadata: {
      prev: "",
      next: "",
      current: "",
    },
  });
};

export default response;
