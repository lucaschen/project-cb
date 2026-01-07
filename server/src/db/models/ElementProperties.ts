import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { ElementPropertyTypes } from "~sharedTypes/enums";

export class ElementProperties extends Model<
  InferAttributes<ElementProperties>,
  InferCreationAttributes<ElementProperties>
> {
  declare id: string;
  declare elementId: string;
  declare description: string;
  declare propertyName: string;
  declare propertyType: ElementPropertyTypes;
  declare required: boolean;
  declare defaultValue: string;

  static initModel(sequelize: Sequelize) {
    ElementProperties.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        elementId: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        propertyName: { type: DataTypes.STRING, allowNull: false },
        propertyType: {
          type: DataTypes.ENUM(...Object.values(ElementPropertyTypes)),
          allowNull: false,
        },
        required: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        defaultValue: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "elementProperties",
        indexes: [
          {
            unique: true,
            fields: ["elementId", "propertyName"],
          },
        ],
      }
    );
    return ElementProperties;
  }
}
