export default (sequelize, DataTypes) => {
    const UserBrawlerItems = sequelize.define("UserBrawlerItems", {
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
        ITEM_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        ITEM_K: {
            type: DataTypes.STRING(12),
            allowNull: false,
        },
        ITEM_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_BRAWLER_ITEMS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserBrawlerItems.associate = models => {
        UserBrawlerItems.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserBrawlerItems.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });
    };

    return UserBrawlerItems;
};