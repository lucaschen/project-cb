import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class NodeCoordinate extends Model<
  InferAttributes<NodeCoordinate>,
  InferCreationAttributes<NodeCoordinate>
> {
  declare nodeId: string;
  declare x: number;
  declare y: number;

  static initModel(sequelize: Sequelize) {
    NodeCoordinate.init(
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
    return NodeCoordinate;
  }
}
