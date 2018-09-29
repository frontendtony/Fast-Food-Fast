import { check, validationResult } from 'express-validator/check';
import menu from '../models/menuModel';
import orders from '../models/ordersModel';


const middleware = {};

middleware.createOrder = (req, res, next) => {
  if (!req.body.foodId) {
    return res.status(400).send({ status: false, message: 'No foodId was received' });
  }
  req.order = orders.addOrder(req.body.foodId);
  if (!req.order) {
    return res.status(404).send({ status: false, message: 'Requested meal does not exist' });
  }
  return next();
};


middleware.getOrder = (req, res, next) => {
  req.order = orders.findOrderById(req.params.id);
  return next();
};


middleware.getOrders = (req, res, next) => {
  req.order = orders.getOders();
  return next();
};

middleware.updateOrder = (req, res, next) => {
  if (!req.body.orderStatus) {
    return res.status(400).send({ status: false, message: 'No data was received to update the orderStatus' });
  }

  const orderStatus = req.body.orderStatus.toLowerCase();

  const validOrderStatus = ['new', 'processing', 'cancelled', 'complete'];
  if (!validOrderStatus.includes(orderStatus)) {
    return res.status(422).send({
      status: false,
      message: 'Invalid orderStatus',
    });
  }

  req.order = orders.updateOrderStatus(req.params.id, orderStatus);
  if (!req.order) {
    return res.status(404).send({ status: false, message: 'Order does not exist' });
  }
  return next();
};


middleware.deleteOrder = (req, res, next) => {
  const deleted = orders.deleteOrder(req.params.id);
  if (!deleted) {
    return res.status(404).send({ status: false, message: 'Order does not exist' });
  }
  [req.order] = deleted;
  return next();
};


middleware.getMenu = (req, res, next) => {
  req.menu = menu.getMeals(req.query.offset, req.query.limit, req.query.search);
  return next();
};

export const validateSignup = (req, res, next) => {
  if (req.body.admin_secret) {
    if (req.body.admin_secret !== process.env.ADMINSECRET) {
      const response = { status: false, message: 'Invalid admin secret' };
      return res.status(401).json(response);
    }
    req.body.isAdmin = true;
  } else {
    req.body.isAdmin = false;
  }

  // Run validations against all form fields

  req.check('firstname')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('First name must not be empty')
    .isAlpha()
    .withMessage('First name can only contain alphabets')
    .isLength({ min: 2, max: 25 })
    .withMessage('First name must have between 2 - 25 characters');

  req.check('lastname')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Last name must not be empty')
    .isAlpha()
    .withMessage('Last name can only contain alphabets')
    .isLength({ min: 2, max: 25 })
    .withMessage('Last name must have between 2 - 25 characters');

  req.check('username')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Username must not be empty')
    .isAlpha()
    .withMessage('Username can only contain alphabets')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username must have between 2 - 25 characters');

  req.check('address')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Address must not be empty')
    .isAlphanumeric()
    .withMessage('Address can only contain alphanumeric characters')
    .isLength({ min: 6, max: 40 })
    .withMessage('Address must have between 6 - 40 characters');

  req.check('phone')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Phone number must not be empty')
    .isNumeric()
    .withMessage('Phone number can only contain numbers')
    .isLength({ min: 11, max: 11 })
    .withMessage('Phone number must have 11 digits');

  req.check('password')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Password must not be empty')
    .isAlphanumeric()
    .withMessage('Password can only contain alphanumeric characters')
    .isLength({ min: 6, max: 25 })
    .withMessage('Password must have between 6 - 25 characters');

  const errors = req.validationErrors();

  if (errors) {
    const result = [];
    errors.forEach(error => result.push(error.msg));
    return res.status(400).json({ status: false, message: 'Invalid user data', result });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  req.check('username')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Username must not be empty');

  req.check('password')
    .exists({ checkNull: true, checkFalsy: true }).withMessage('Password must not be empty');

  const errors = req.validationErrors();

  if (errors) {
    const result = [];
    errors.forEach(error => result.push(error.msg));
    return res.status(400).json({ status: false, message: 'Invalid Username/Password', result });
  }

  next();
};

export default middleware;
