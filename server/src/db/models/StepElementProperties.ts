import {
  CreationOptional,
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
  declare id: CreationOptional<string>;
  declare stepElementId: string;
  declare propertyId: string;
  declare propertyValue: string;

  static initModel(sequelize: Sequelize) {
    StepElementProperties.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
        },
        stepElementId: { type: DataTypes.STRING, allowNull: false },
        propertyId: { type: DataTypes.STRING, allowNull: false },
        propertyValue: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "stepElementsProperties",
        indexes: [{ unique: true, fields: ["stepElementId", "propertyId"] }],
      },
    );

    return StepElementProperties;
  }
}
