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
  declare apiKey: string;

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
        apiKey: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "organizations",
        indexes: [
          { unique: true, fields: ["apiKey"] },
          { unique: true, fields: ["slug"] },
        ],
      }
    );
    return Organization;
  }
}
