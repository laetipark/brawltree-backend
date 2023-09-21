export default (sequelize, DataTypes) => {
    const UserFriends = sequelize.define("UserFriends", {
        USER_ID: {
            type: DataTypes.STRING(12),
            primaryKey: true,
            allowNull: false,
        },
        FRIEND_ID: {
            type: DataTypes.STRING(12),
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
            primaryKey: true,
            allowNull: false,
        },
        FRIEND_NM: {
            type: DataTypes.STRING(30),
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
        FRIEND_PT: {
            type: DataTypes.FLOAT,
            allowNull: true,
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
        tableName: "USER_FRIENDS",
        timestamps: false,
        underscore: false,
        paranoid: false,
    });

    UserFriends.associate = models => {
        UserFriends.belongsTo(models.Users, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserFriends.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "USER_ID"
        });

        UserFriends.belongsTo(models.UserProfile, {
            foreignKey: "USER_ID", sourceKey: "FRIEND_ID"
        });
    };

    return UserFriends;
};