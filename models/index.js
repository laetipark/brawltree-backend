import Sequelize from "sequelize";

import users from "./users.js";
import userProfile from "./user_profile.js";
import userBattles from "./user_battles.js";
import userBrawlers from "./user_brawlers.js";
import userBrawlerItems from "./user_brawler_items.js";
import userBrawlerBattles from "./user_brawler_battles.js";
import events from "./events.js";
import maps from "./maps.js";
import mapRotation from "./map_rotation.js";
import brawlers from "./brawlers.js";
import battlePicks from "./battle_picks.js";
import battleTrio from "./battle_trio.js";
import seasons from "./seasons.js";

import config from "../config/config.js";

export const sequelize =
    new Sequelize(config.sequelize.database, config.sequelize.username, config.sequelize.password, config.sequelize);
const db = {}
db.sequelize = sequelize;

db.Users = users(sequelize, Sequelize.DataTypes);
db.UserProfile = userProfile(sequelize, Sequelize.DataTypes);
db.UserBattles = userBattles(sequelize, Sequelize.DataTypes);
db.UserBrawlers = userBrawlers(sequelize, Sequelize.DataTypes);
db.UserBrawlerItems = userBrawlerItems(sequelize, Sequelize.DataTypes);
db.UserBrawlerBattles = userBrawlerBattles(sequelize, Sequelize.DataTypes);

db.Maps = maps(sequelize, Sequelize.DataTypes);
db.MapRotation = mapRotation(sequelize, Sequelize.DataTypes);
db.Events = events(sequelize, Sequelize.DataTypes);
db.Seasons = seasons(sequelize, Sequelize.DataTypes);

db.Brawlers = brawlers(sequelize, Sequelize.DataTypes);
db.BattlePicks = battlePicks(sequelize, Sequelize.DataTypes);
db.BattleTrio = battleTrio(sequelize, Sequelize.DataTypes);

db.Users.associate(db);
db.UserProfile.associate(db);
db.UserBattles.associate(db);
db.UserBrawlers.associate(db);
db.UserBrawlerItems.associate(db);
db.UserBrawlerBattles.associate(db);

db.Maps.associate(db);
db.MapRotation.associate(db);
db.Events.associate(db);

db.Brawlers.associate(db);
db.BattlePicks.associate(db);
db.BattleTrio.associate(db);

export const Users = db.Users;
export const UserProfile = db.UserProfile;
export const UserBattles = db.UserBattles;
export const UserBrawlers = db.UserBrawlers;
export const UserBrawlerItems = db.UserBrawlerItems;
export const UserBrawlerBattles = db.UserBrawlerBattles;

export const Maps = db.Maps;
export const MapRotation = db.MapRotation;
export const Events = db.Events;

export const Brawlers = db.Brawlers;
export const BattlePicks = db.BattlePicks;
export const BattleTrio = db.BattleTrio;

export const Seasons = db.Seasons;

export default db;