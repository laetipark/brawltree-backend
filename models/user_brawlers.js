export default (sequelize, DataTypes) => {
    const UserBrawlers = sequelize.define("UserBrawlers", {
        USER_ID: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_PWR: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        TROPHY_BGN: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        TROPHY_CUR: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        TROPHY_HGH: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        TROPHY_RNK: {
            type: DataTypes.STRING(2),
            allowNull: false,
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_BRAWLERS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserBrawlers.associate = models => {
        UserBrawlers.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserBrawlers.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });
    };

    return UserBrawlers;
};