
// Middleware de tratamento de erros
const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
      status: 500,
      message: "Something went wrong",
      error: err.message,
    });
  };
  
  module.exports = errorHandling;


