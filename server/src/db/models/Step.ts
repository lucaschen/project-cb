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
  declare nodeId: string;
  declare nextNodeId: string | null;

  static initModel(sequelize: Sequelize) {
    Step.init(
      {
        nodeId: { type: DataTypes.UUID, primaryKey: true },
        nextNodeId: { type: DataTypes.UUID, allowNull: true },
      },
      {
        sequelize,
        tableName: "steps",
      }
    );
    return Step;
  }
}
