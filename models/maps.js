export default (sequelize, DataTypes) => {
    const Maps = sequelize.define("Maps", {
        MAP_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        MAP_MD: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        MAP_NM: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "MAPS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    Maps.associate = models => {
        Maps.hasOne(models.MapRotation, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        Maps.hasMany(models.Events, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        Maps.hasMany(models.UserBattles, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        Maps.hasMany(models.UserBrawlerBattles, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        Maps.hasMany(models.BrawlerStats, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });
    };

    return Maps;
};