import db from '../config/dbconfig';

class Order {
  static getOrders(req, res) {
    if (!req.user.isadmin) {
      return res.status(403).json({
        status: false,
        message: "Only admins can view all orders"
      });
    }
    
    const query = `select orders.id, firstname, lastname, orders.address, 
                  amount, food_ids, order_status, created_on FROM orders 
                  JOIN users ON orders.user_id = users.id`;
    db.query(query)
      .then((orders) => {
        return res.status(200).json({ status: true, result: orders.rows });
      });
  }
  
  static getUserOrders(req, res) {
    if (req.user.id != req.params.id && !req.user.isadmin) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to view other users' orders"
      });
    }
    db.query(`SELECT * FROM orders WHERE user_id = ${req.params.id}`)
      .then((orders) => {
        return res.status(200).json({ status: true, result: orders.rows });
      });
  }
  
  static getOrder(req, res) {
    const query = `select orders.id, firstname, lastname, orders.address, 
                  amount, food_ids, order_status, created_on, user_id
                  FROM orders 
                  JOIN users ON orders.user_id = users.id
                  WHERE orders.id = '${req.params.id}'`;
    
    db.query(query)
      .then((response) => {
        if (response.rowCount === 0) {
          return res.status(404).json({
            status: false,
            message: 'No order exists for the specified id'});
        }
        
        const result = response.rows[0];
        
        if (req.user.id !== result.user_id && !req.user.isadmin) {
          return res.status(403).json({
            status: false,
            message: "Only admins can view an order of another user"
          });
        }
        return res.status(200).json({ status: true, result });
      });
  }
  
  static createOrder(req, res) {
    if (req.user.isadmin) {
      return res.status(403).json({
        status: false,
        message: 'Admins cannot place orders'
      });
    }
    const foodIds = req.body.foodIds;
    const address = req.body.address || req.user.address;
    const queryString = `INSERT INTO 
      orders(user_id, amount, address, food_ids, order_status)
      VALUES('${req.user.id}', '${req.amount}', '${address}', 
        ARRAY[${foodIds}], 'new')
      RETURNING *`;
      
    db.query(queryString)
      .then((order) => {
        return res.status(201).json({
          status: true,
          message: 'Order created successfully',
          result: order.rows[0]
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: false, 
          message: 'An error occured, please try again later' });
      });
  }
  
  static updateOrderStatus(req, res) {
    if (!req.user.isadmin) {
      return res.status(403).json({
        status: false,
        message: 'Only admins can change the status of an order'
      });
    }
    const queryString = `UPDATE orders
      SET order_status = '${req.orderStatus}' 
      WHERE id = '${req.params.id}' RETURNING *`;
      
    db.query(queryString)
      .then((order) => {
        return res.status(200).json({
          status: true,
          message: `Status has been updated to ${order.rows[0].order_status}`,
          result: order.rows[0]
        });
      })
      .catch((error) => {
        return res.status(404).json({
          status: false,
          message: 'No order exists for the specified id'
        });
      });
  }
};

export default Order;
