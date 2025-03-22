import { DataTypes } from "sequelize";

export default function JwtModelInit(sequelizeConfig) {
  const Jwt = sequelizeConfig.define("jwt", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  return Jwt;
}
