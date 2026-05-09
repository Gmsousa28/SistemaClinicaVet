//instalar biblioteca npm install joi
//esta biblioteca serve para colocar restriçoes, por exemplo, só perite criar clientes com no mínimo de 3 letras no primeiro nome, etc
const Joi = require("joi");

const customerScheme = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).required(), // formato de telefone desejado
  complaints: Joi.number().min(0).required(), 
});

const validateCustomers = (req, res, next) => {
  const { error } = customerScheme.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = validateCustomers;
