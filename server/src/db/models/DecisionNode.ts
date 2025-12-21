import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ComparisonOperation } from "./enums";

export class DecisionNode extends Model<
  InferAttributes<DecisionNode>,
  InferCreationAttributes<DecisionNode>
> {
  declare id: string;
  declare name: string;
  declare flow_id: string;
  declare target_value: string | null;
  declare operation: ComparisonOperation;
  declare comparison_value: string | null;
  declare x: number;
  declare y: number;

  static initModel(sequelize: Sequelize) {
    DecisionNode.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        flow_id: { type: DataTypes.STRING, allowNull: false },
        target_value: { type: DataTypes.STRING, allowNull: true },
        operation: {
          type: DataTypes.ENUM(...Object.values(ComparisonOperation)),
          allowNull: false,
        },
        comparison_value: { type: DataTypes.STRING, allowNull: true },
        x: { type: DataTypes.FLOAT, allowNull: false },
        y: { type: DataTypes.FLOAT, allowNull: false },
      },
      {
        sequelize,
        tableName: "decision_nodes",
        indexes: [{ fields: ["flow_id"] }],
      }
    );
    return DecisionNode;
  }
}
