import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class NodeCoordinates extends Model<
  InferAttributes<NodeCoordinates>,
  InferCreationAttributes<NodeCoordinates>
> {
  declare nodeId: string;
  declare x: number;
  declare y: number;

  static initModel(sequelize: Sequelize) {
    NodeCoordinates.init(
      {
        nodeId: { type: DataTypes.UUID, primaryKey: true },
        x: { type: DataTypes.FLOAT, allowNull: false },
        y: { type: DataTypes.FLOAT, allowNull: false },
      },
      {
        sequelize,
        tableName: "nodeCoordinates",
      }
    );
    return NodeCoordinates;
  }
}
