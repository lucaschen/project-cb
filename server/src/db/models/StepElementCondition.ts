import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { ComparisonOperation } from "~sharedTypes/enums";

export class StepElementCondition extends Model<
  InferAttributes<StepElementCondition>,
  InferCreationAttributes<StepElementCondition>
> {
  declare id: string;
  declare stepElementId: string;
  declare value: string | null;
  declare operation: ComparisonOperation;
  declare comparisonValue: string | null;

  static initModel(sequelize: Sequelize) {
    StepElementCondition.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        stepElementId: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING, allowNull: true },
        operation: {
          type: DataTypes.ENUM(...Object.values(ComparisonOperation)),
          allowNull: false,
        },
        comparisonValue: { type: DataTypes.STRING, allowNull: true },
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
