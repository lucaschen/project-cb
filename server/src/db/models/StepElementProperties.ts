import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class StepElementProperties extends Model<
  InferAttributes<StepElementProperties>,
  InferCreationAttributes<StepElementProperties>
> {
  declare id: string;
  declare stepElementId: string;
  declare propertyId: string;
  declare propertyValue: string;

  static initModel(sequelize: Sequelize) {
    StepElementProperties.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        stepElementId: { type: DataTypes.STRING, allowNull: false },
        propertyId: { type: DataTypes.STRING, allowNull: false },
        propertyValue: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "step_elements_properties",
        indexes: [
          { unique: true, fields: ["step_element_id", "property_id"] }, // name should be unique - per step
        ],
      }
    );
    return StepElementProperties;
  }
}
