export default (sequelize, DataTypes) => {
    const UserBattles = sequelize.define("UserBattles", {
        USER_ID: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        PLAYER_ID: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        BRAWLER_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        MATCH_DT: {
            type: DataTypes.DATE,
            primaryKey: true,
            allowNull: false,
        },
        MAP_ID: {
            type: DataTypes.CHAR(8),
            allowNull: false,
        },
        MAP_MD_CD: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_TYP: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_TYP_RAW: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_GRD: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_DUR: {
            type: DataTypes.TINYINT.UNSIGNED,
            allowNull: true,
        },
        MATCH_RNK: {
            type: DataTypes.TINYINT,
            allowNull: true,
        },
        MATCH_RES: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_CHG: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        MATCH_CHG_RAW: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        PLAYER_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        PLAYER_TM_NO: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        PLAYER_SP_BOOL: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        BRAWLER_PWR: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        BRAWLER_TRP: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_BATTLES",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserBattles.associate = models => {
        UserBattles.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserBattles.belongsTo(models.Brawlers, {
            foreignKey: "BRAWLER_ID", sourceKey: "BRAWLER_ID"
        });

        UserBattles.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });
    };

    return UserBattles;
};