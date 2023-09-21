export default (sequelize, DataTypes) => {
    const MapRotation = sequelize.define("MapRotation", {
        MAP_ID: {
            type: DataTypes.CHAR(8),
            primaryKey: true,
            allowNull: false,
        },
        ROTATION_TL_BOOL: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        ROTATION_PL_BOOL: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "MAP_ROTATION",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    MapRotation.associate = models => {
        MapRotation.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        MapRotation.hasMany(models.Events, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });
    };

    return MapRotation;
};