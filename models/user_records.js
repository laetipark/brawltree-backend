export default (sequelize, DataTypes) => {
    const UserRecords = sequelize.define("UserRecords", {
        USER_ID: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        MATCH_TYP: {
            type: DataTypes.TINYINT,
            primaryKey: true,
            allowNull: false,
        },
        MATCH_GRD: {
            type: DataTypes.TINYINT,
            primaryKey: true,
            allowNull: false,
        },
        MAP_MD: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        MATCH_CHG: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MATCH_CNT: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MATCH_CNT_VIC: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MATCH_CNT_DEF: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_RECORDS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserRecords.associate = models => {
        UserRecords.belongsTo(models.Users, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserRecords.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });
    };

    return UserRecords;
};