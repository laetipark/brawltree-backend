export default (sequelize, DataTypes) => {
    const Brawlers = sequelize.define("Brawlers", {
        BRAWLER_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_NM: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_RRT: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        BRAWLER_CL: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        BRAWLER_GNDR: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        BRAWLER_ICN: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        BRAWLER_SP1_ID: {
            type: DataTypes.CHAR(8),
            allowNull: false,
        },
        BRAWLER_SP1_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        BRAWLER_SP2_ID: {
            type: DataTypes.CHAR(8),
            allowNull: false,
        },
        BRAWLER_SP2_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        BRAWLER_GDG1_ID: {
            type: DataTypes.CHAR(8),
            allowNull: false,
        },
        BRAWLER_GDG1_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        BRAWLER_GDG2_ID: {
            type: DataTypes.CHAR(8),
            allowNull: false,
        },
        BRAWLER_GDG2_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "BRAWLERS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    Brawlers.associate = models => {
        Brawlers.hasMany(models.BrawlerStats, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        Brawlers.hasMany(models.UserBattles, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        Brawlers.hasMany(models.UserBrawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        Brawlers.hasMany(models.UserBrawlerItems, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        Brawlers.hasMany(models.UserBrawlerBattles, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });
    };

    return Brawlers;
};