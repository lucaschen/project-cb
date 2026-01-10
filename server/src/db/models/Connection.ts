import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Connection extends Model<
  InferAttributes<Connection>,
  InferCreationAttributes<Connection>
> {
  declare id: string;
  declare fromNodeId: string;
  declare toNodeId: string;
  declare fromNodeConnectionIndex: number;

  static initModel(sequelize: Sequelize) {
    Connection.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        fromNodeId: { type: DataTypes.STRING, allowNull: false },
        toNodeId: { type: DataTypes.STRING, allowNull: false },
        fromNodeConnectionIndex: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "connections",
        indexes: [
          { unique: true, fields: ["fromNodeId", "toNodeId"] },
          { fields: ["toNodeId"] },
        ],
      }
    );
    return Connection;
  }
}
