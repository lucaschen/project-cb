import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Step extends Model<
  InferAttributes<Step>,
  InferCreationAttributes<Step>
> {
  declare id: string;
  declare name: string;
  declare flowId: string;
  declare x: number;
  declare y: number;

  static initModel(sequelize: Sequelize) {
    Step.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        flowId: { type: DataTypes.STRING, allowNull: false },
        x: { type: DataTypes.FLOAT, allowNull: false },
        y: { type: DataTypes.FLOAT, allowNull: false },
      },
      {
        sequelize,
        tableName: "steps",
        indexes: [{ fields: ["flowId"] }],
      }
    );
    return Step;
  }
}
