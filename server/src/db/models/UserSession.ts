import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class UserSession extends Model<
  InferAttributes<UserSession>,
  InferCreationAttributes<UserSession>
> {
  declare id: string;
  declare user_id: string;
  declare session_token: string;
  declare expires_at: Date;

  static initModel(sequelize: Sequelize) {
    UserSession.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        user_id: { type: DataTypes.STRING, allowNull: false },
        session_token: { type: DataTypes.STRING, allowNull: false },
        expires_at: { type: DataTypes.DATE, allowNull: false },
      },
      {
        sequelize,
        tableName: "user_sessions",
        indexes: [
          { unique: true, fields: ["session_token"] },
          { fields: ["user_id"] },
          { fields: ["expires_at"] },
        ],
      }
    );
    return UserSession;
  }
}
