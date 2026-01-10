import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Element extends Model<
  InferAttributes<Element>,
  InferCreationAttributes<Element>
> {
  declare id: string;
  declare name: string;
  declare description: string;

  static initModel(sequelize: Sequelize) {
    Element.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true }, // not UUID, responsible for component name mapping in FE
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "elements",
      }
    );
    return Element;
  }
}
