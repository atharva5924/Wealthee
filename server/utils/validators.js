import Joi from "joi";

export const validateRegistration = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().max(100).allow(""),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    risk_appetite: Joi.string()
      .valid("low", "moderate", "high")
      .default("moderate"),
  });

  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    investment_type: Joi.string()
      .valid("bond", "fd", "mf", "etf", "other")
      .required(),
    tenure_months: Joi.number().integer().min(1).max(600).required(),
    annual_yield: Joi.number().min(0).max(100).required(),
    risk_level: Joi.string().valid("low", "moderate", "high").required(),
    min_investment: Joi.number().min(0).default(1000),
    max_investment: Joi.number().min(Joi.ref("min_investment")).allow(null),
    description: Joi.string().allow("", null),
  });

  return schema.validate(data);
};

export const validateInvestment = (data) => {
  const schema = Joi.object({
    product_id: Joi.string().required(),
    amount: Joi.number().min(0).required(),
  });

  return schema.validate(data);
};
