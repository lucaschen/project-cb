import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { StepElementType } from "./enums";

export class StepElement extends Model<
  InferAttributes<StepElement>,
  InferCreationAttributes<StepElement>
> {
  declare id: string;
  declare name: string;
  declare type: StepElementType;
  declare order: number;

  static initModel(sequelize: Sequelize) {
    StepElement.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: {
          type: DataTypes.ENUM(...Object.values(StepElementType)),
          allowNull: false,
        },
        order: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        tableName: "step_elements",
        indexes: [{ fields: ["order"] }],
      }
    );
    return StepElement;
  }
}
