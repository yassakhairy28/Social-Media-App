const notFoundHandler = (req, res, next) => {
  return next(new Error("page not found", { cause: 404 }));
};

export default notFoundHandler;
