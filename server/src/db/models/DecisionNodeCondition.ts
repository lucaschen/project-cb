import type { ConditionStatement } from "@packages/shared/db/schemas/conditionStatement";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class DecisionNodeCondition extends Model<
  InferAttributes<DecisionNodeCondition>,
  InferCreationAttributes<DecisionNodeCondition>
> {
  declare id: string;
  declare nodeId: string;
  declare toNodeId: string;
  declare statement: ConditionStatement;
  declare order: number;

  static initModel(sequelize: Sequelize) {
    DecisionNodeCondition.init(
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        nodeId: { type: DataTypes.UUID, allowNull: false },
        toNodeId: { type: DataTypes.UUID, allowNull: false },
        statement: { type: DataTypes.JSONB, allowNull: false },
        order: { type: DataTypes.SMALLINT, allowNull: false },
      },
      {
        sequelize,
        tableName: "decisionNodeConditions",
        indexes: [{ fields: ["nodeId"] }, { fields: ["toNodeId"] }],
      }
    );
    return DecisionNodeCondition;
  }
}
