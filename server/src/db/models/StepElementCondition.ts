import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { ConditionStatement } from "~sharedTypes/conditionStatement";

export class StepElementCondition extends Model<
  InferAttributes<StepElementCondition>,
  InferCreationAttributes<StepElementCondition>
> {
  declare id: string;
  declare stepElementId: string;
  declare statement: ConditionStatement;

  static initModel(sequelize: Sequelize) {
    StepElementCondition.init(
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        stepElementId: { type: DataTypes.STRING, allowNull: false },
        statement: { type: DataTypes.JSONB, allowNull: false },
      },
      {
        sequelize,
        tableName: "stepElementConditions",
        indexes: [{ fields: ["stepElementId"] }],
      }
    );
    return StepElementCondition;
  }
}
