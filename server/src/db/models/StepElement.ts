import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class StepElement extends Model<
  InferAttributes<StepElement>,
  InferCreationAttributes<StepElement>
> {
  declare id: string;
  declare name: string;
  declare elementId: string;
  declare stepId: string;
  declare order: number;

  static initModel(sequelize: Sequelize) {
    StepElement.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        elementId: { type: DataTypes.STRING, allowNull: false },
        stepId: { type: DataTypes.STRING, allowNull: false },
        order: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        tableName: "step_elements",
        indexes: [
          { unique: true, fields: ["step_id", "name"] }, // name should be unique - per step
          { fields: ["order"] },
        ],
      }
    );
    return StepElement;
  }
}
