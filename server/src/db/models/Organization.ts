import {
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
  declare api_key: string;

  static initModel(sequelize: Sequelize) {
    Organization.init(
      {
        id: {
          type: DataTypes.STRING,
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
        api_key: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "organizations",
        indexes: [
          { unique: true, fields: ["api_key"] },
          { unique: true, fields: ["slug"] },
        ],
      }
    );
    return Organization;
  }
}
