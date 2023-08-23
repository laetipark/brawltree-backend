export default (sequelize, DataTypes) => {
    const UserBrawlerBattles = sequelize.define("UserBrawlerBattles", {
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
        MAP_ID: {
            type: DataTypes.CHAR(8),
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
        MATCH_CNT: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MATCH_VIC_CNT: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        MATCH_DEF_CNT: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_BRAWLER_BATTLES",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserBrawlerBattles.associate = models => {
        UserBrawlerBattles.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserBrawlerBattles.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        UserBrawlerBattles.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });
    };

    return UserBrawlerBattles;
};