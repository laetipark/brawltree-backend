export default (sequelize, DataTypes) => {
    const Events = sequelize.define("Events", {
        ROTATION_SLT_NO: {
            type: DataTypes.TINYINT,
            primaryKey: true,
            allowNull: false,
        },
        ROTATION_BGN_DT: {
            type: DataTypes.DATE,
            primaryKey: true,
            allowNull: false,
        },
        ROTATION_END_DT: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        MAP_ID: {
            type: DataTypes.CHAR(8),
            allowNull: true,
        },
        MAP_MDFS: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "EVENTS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    Events.associate = models => {
        Events.belongsTo(models.Maps, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });

        Events.belongsTo(models.MapRotation, {
            foreignKey: "MAP_ID", sourceKey: "MAP_ID"
        });
    };

    return Events;
};