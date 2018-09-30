import { check, validationResult } from 'express-validator/check';
import menu from '../models/menuModel';
import orders from '../models/ordersModel';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const middleware = {};

middleware.validateMenuItem = (req, res, next) => {
  req.check('name')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Name cannot be empty')
    .isAlpha()
    .withMessage('Name can only contain alphabets')
    .isLength({ min: 2, max: 25})
    .withMessage('Name must be between 2 to 25 characters');
    
  req.check('cost')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Cost cannot be empty')
    .isInt()
    .withMessage('Cost can only contain whole numbers')
    .isLength({ min: 3, max: 5 })
    .withMessage('Cost must be between 3 to 5 digits');
    
  req.check('image')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Image cannot be empty')
    .isURL()
    .withMessage('Image must be a valid URL');
  
  const errors = req.validationErrors();

  if (errors) {
    const result = [];
    errors.forEach(error => result.push(error.msg));
    return res.status(422).json({ 
      status: false, 
      message: 'Invalid food data', result });
  }

  next();
};

middleware.validateFoodIds = async (req, res, next) => {
  if (!req.body.foodIds || !req.body.foodIds[0]) {
    return res.status(422).json({
      status: false,
      message: 'No foodId received'
    });
  }
  
  // Check if foodIds exist in the database
  const foodIds = req.body.foodIds;
  
  const queryString = `SELECT COUNT(id) as count, SUM(cost) as sum 
    FROM menu WHERE id IN (${foodIds})`;
    
  pool.query(queryString)
    .then((response) => {
      if (!(response.rows[0].count == foodIds.length)) {
        return res.status(422).json({
          status: false,
          message: 'Invalid foodId'
        });
      }
      req.amount = response.rows[0].sum;
      return next();
    })
    .catch((error) => {
      return res.status(422).json({
        status: false,
        message: 'foodIds should only include numbers' });
    });
};

middleware.validateOrderStatus = (req, res, next) => {
  if (!req.body.orderStatus) {
    return res.status(422).json({
      status: false,
      message: 'No orderStatus received'
    });
  }

  const orderStatus = req.body.orderStatus.toLowerCase();
  const validOrderStatus = ['new', 'processing', 'cancelled', 'complete'];
  
  if (!validOrderStatus.includes(orderStatus)) {
    return res.status(422).send({
      status: false,
      message: 'Invalid orderStatus',
    });
  }
  next();
};

export const validateSignup = (req, res, next) => {
  if (req.body.admin_secret) {
    if (req.body.admin_secret !== process.env.ADMINSECRET) {
      const response = { status: false, message: 'Invalid admin secret' };
      return res.status(422).json(response);
    }
    req.body.isAdmin = true;
  } else {
    req.body.isAdmin = false;
  }

  // Run validations against all form fields

  req.check('firstname')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('First name must not be empty')
    .isAlpha()
    .withMessage('First name can only contain alphabets')
    .isLength({ min: 2, max: 25 })
    .withMessage('First name must have between 2 - 25 characters');

  req.check('lastname')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Last name must not be empty')
    .isAlpha()
    .withMessage('Last name can only contain alphabets')
    .isLength({ min: 2, max: 25 })
    .withMessage('Last name must have between 2 - 25 characters');

  req.check('username')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Username must not be empty')
    .isAlpha()
    .withMessage('Username can only contain alphabets')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username must have between 2 - 25 characters');

  req.check('address')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Address must not be empty')
    .isAlphanumeric()
    .withMessage('Address can only contain alphanumeric characters')
    .isLength({ min: 6, max: 40 })
    .withMessage('Address must have between 6 - 40 characters');

  req.check('phone')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Phone number must not be empty')
    .isNumeric({ min: 11, max: 11 })
    .withMessage('Phone number can only contain numbers')
    .isLength({ min: 11, max: 11 })
    .withMessage('Phone number must be exactly 11 digts');

  req.check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Password must not be empty')
    .isAlphanumeric()
    .withMessage('Password can only contain alphanumeric characters')
    .isLength({ min: 6, max: 25 })
    .withMessage('Password must have between 6 - 25 characters');

  const errors = req.validationErrors();

  if (errors) {
    const result = [];
    errors.forEach(error => result.push(error.msg));
    return res.status(422).json({ 
      status: false, 
      message: 'Invalid user data', result });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  req.check('username')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Username must not be empty');

  req.check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Password must not be empty');

  const errors = req.validationErrors();

  if (errors) {
    const result = [];
    errors.forEach(error => result.push(error.msg));
    return res.status(422).json({ 
      status: false, 
      message: 'Invalid Username/Password', result });
  }

  next();
};

export default middleware;
