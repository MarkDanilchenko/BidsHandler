// --------------------------------------CONTROLLER_CONFIG
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const { User, TokenBlacklist, UserRole, UserRequest } = require('../models/db_orm.js');

// --------------------------------------CONTROLLER
class RequestController {}

// --------------------------------------EXPORT
module.exports = new RequestController();
