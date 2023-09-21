export default (sequelize, DataTypes) => {
    const BrawlerStats = sequelize.define("BrawlerStats", {
        MAP_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_ID: {
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
        MAP_MD: {
            type: DataTypes.STRING(12),
            allowNull: false,
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
        tableName: "BRAWLER_STATS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    BrawlerStats.associate = models => {
        BrawlerStats.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        BrawlerStats.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });
    };

    return BrawlerStats;
};