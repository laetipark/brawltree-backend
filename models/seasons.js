export default (sequelize, DataTypes) => {
    return sequelize.define("Seasons", {
        SEASON_NO: {
            type: DataTypes.TINYINT.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        SEASON_BGN_DT: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        SEASON_END_DT: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "SEASONS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });
};