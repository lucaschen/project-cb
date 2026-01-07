import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Flow extends Model<
  InferAttributes<Flow>,
  InferCreationAttributes<Flow>
> {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare slug: string;

  static initModel(sequelize: Sequelize) {
    Flow.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        organizationId: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "flows",
        indexes: [{ unique: true, fields: ["organizationId", "slug"] }],
      }
    );
    return Flow;
  }
}
