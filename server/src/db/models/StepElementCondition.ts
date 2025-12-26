import { ComparisonOperation } from "@sharedTypes/enums";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

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
        tableName: "step_element_conditions",
        indexes: [{ fields: ["step_element_id"] }],
      }
    );
    return StepElementCondition;
  }
}
