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
  declare userId: string;
  declare sessionToken: string;
  declare expiresAt: Date;

  static initModel(sequelize: Sequelize) {
    UserSession.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        userId: { type: DataTypes.STRING, allowNull: false },
        sessionToken: { type: DataTypes.STRING, allowNull: false },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
      },
      {
        sequelize,
        tableName: "userSessions",
        indexes: [
          { unique: true, fields: ["sessionToken"] },
          { fields: ["userId"] },
          { fields: ["expiresAt"] },
        ],
      }
    );
    return UserSession;
  }
}
