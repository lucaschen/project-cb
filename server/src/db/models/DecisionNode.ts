import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class DecisionNode extends Model<
  InferAttributes<DecisionNode>,
  InferCreationAttributes<DecisionNode>
> {
  declare nodeId: string;
  declare fallbackNextNodeId: string;

  static initModel(sequelize: Sequelize) {
    DecisionNode.init(
      {
        nodeId: { type: DataTypes.UUID, primaryKey: true },
        fallbackNextNodeId: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "decisionNodes",
      }
    );
    return DecisionNode;
  }
}
