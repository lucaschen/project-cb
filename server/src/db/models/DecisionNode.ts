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
  declare fallbackNextNodeId: string | null;

  static initModel(sequelize: Sequelize) {
    DecisionNode.init(
      {
        nodeId: { type: DataTypes.UUID, primaryKey: true },
        fallbackNextNodeId: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: "decisionNodes",
      },
    );
    return DecisionNode;
  }
}
