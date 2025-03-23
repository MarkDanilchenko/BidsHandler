import Sequelize from "sequelize";
import { postgreSQLOptions } from "../env.js";
import JwtModelInit from "./jwt.js";
import UserModelInit from "./user.js";
import BidModelInit from "./bid.js";
import CommentModelInit from "./comment.js";

const sequelizeConnection = new Sequelize(
  postgreSQLOptions.databaseName,
  postgreSQLOptions.username,
  postgreSQLOptions.password,
  {
    dialect: "postgres",
    host: postgreSQLOptions.host,
    port: postgreSQLOptions.port,
    define: {
      timestamps: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

// init models
const Jwt = JwtModelInit(sequelizeConnection);
const User = UserModelInit(sequelizeConnection);
const Bid = BidModelInit(sequelizeConnection);
const Comment = CommentModelInit(sequelizeConnection);

// associations
User.hasOne(Jwt, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Jwt.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });

Bid.belongsTo(User, { foreignKey: "authorId", onDelete: "CASCADE", onUpdate: "CASCADE" });

Comment.belongsTo(User, { foreignKey: "authorId", onDelete: "CASCADE", onUpdate: "CASCADE" });
Bid.hasMany(Comment, { foreignKey: "bidId", onDelete: "CASCADE", onUpdate: "CASCADE" });

export { sequelizeConnection, Jwt, User, Bid, Comment };
