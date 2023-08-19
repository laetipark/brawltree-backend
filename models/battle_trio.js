export default (sequelize, DataTypes) => {
    const BattleTrio = sequelize.define("BattleTrio", {
        MAP_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_1_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_2_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_3_ID: {
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
        tableName: "BATTLE_TRIO",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    BattleTrio.associate = models => {
        BattleTrio.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        BattleTrio.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_1_ID", sourceKey: "BRAWLER_ID"
        });
        BattleTrio.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_2_ID", sourceKey: "BRAWLER_ID"
        });
        BattleTrio.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_3_ID", sourceKey: "BRAWLER_ID"
        });
    };

    return BattleTrio;
};