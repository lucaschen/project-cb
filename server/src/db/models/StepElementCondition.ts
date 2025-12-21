import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ComparisonOperation } from "./enums";

export class StepElementCondition extends Model<
  InferAttributes<StepElementCondition>,
  InferCreationAttributes<StepElementCondition>
> {
  declare id: string;
  declare step_element_id: string;
  declare value: string | null;
  declare operation: ComparisonOperation;
  declare comparison_value: string | null;

  static initModel(sequelize: Sequelize) {
    StepElementCondition.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        step_element_id: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING, allowNull: true },
        operation: {
          type: DataTypes.ENUM(...Object.values(ComparisonOperation)),
          allowNull: false,
        },
        comparison_value: { type: DataTypes.STRING, allowNull: true },
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
