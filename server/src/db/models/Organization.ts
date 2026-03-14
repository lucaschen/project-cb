import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class Organization extends Model<
  InferAttributes<Organization>,
  InferCreationAttributes<Organization>
> {
  declare id: string;
  declare name: string;
  declare slug: string;
  declare deletedAt: CreationOptional<Date | null>;

  static initModel(sequelize: Sequelize) {
    Organization.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        tableName: "organizations",
        indexes: [{ unique: true, fields: ["slug"] }],
      }
    );
    return Organization;
  }
}
