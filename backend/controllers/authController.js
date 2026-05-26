const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const response = require('../utils/responseHandler');

const JWT_SECRET =
  process.env.JWT_SECRET || 'testsecret';


// ➤ REGISTER
exports.register = async (req, res, next) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return response.error(
      res,
      'Invalid request ❌',
      400
    );
  }

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    userModel.createUser(
      name,
      email,
      hashedPassword,
      (err) => {

        if (err) {

          if (err.code === 'ER_DUP_ENTRY') {
            return response.error(
              res,
              'Email already exists ❌',
              400
            );
          }

          return next(err);
        }

        return response.success(
          res,
          null,
          'Account created successfully ✅',
          201
        );
      }
    );

  } catch (error) {

    return next(error);

  }
};


// ➤ LOGIN
exports.login = (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return response.error(
      res,
      'Invalid request ❌',
      400
    );
  }

  userModel.findUserByEmail(
    email,
    async (err, result) => {

      if (err) return next(err);

      if (result.length === 0) {
        return response.error(
          res,
          'User not found ❌',
          404
        );
      }

      const user = result[0];

      try {

        const isMatch =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!isMatch) {
          return response.error(
            res,
            'Invalid password ❌',
            400
          );
        }

        const token = jwt.sign(

          {
            id: user.id,
            email: user.email,
            name: user.name
          },

          JWT_SECRET,

          {
            expiresIn: '1d'
          }

        );

        return response.success(
          res,
          {
            token,

            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          },

          'Login successful ✅'
        );

      } catch (error) {

        return next(error);

      }

    }
  );
};