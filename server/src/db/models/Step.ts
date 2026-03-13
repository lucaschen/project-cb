import {
  CreationOptional,
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
  declare order: CreationOptional<number>;

  static initModel(sequelize: Sequelize) {
    Step.init(
      {
        nodeId: { type: DataTypes.UUID, primaryKey: true },
        nextNodeId: { type: DataTypes.UUID, allowNull: true },
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "steps",
      }
    );
    return Step;
  }
}
