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
  declare from_node_id: string;
  declare to_node_id: string;
  declare from_node_connection_index: number;

  static initModel(sequelize: Sequelize) {
    Connection.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        from_node_id: { type: DataTypes.STRING, allowNull: false },
        to_node_id: { type: DataTypes.STRING, allowNull: false },
        from_node_connection_index: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "connections",
        indexes: [
          { unique: true, fields: ["from_node_id", "to_node_id"] },
          { fields: ["to_node_id"] },
        ],
      }
    );
    return Connection;
  }
}
