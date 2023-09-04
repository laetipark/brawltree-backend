import db from "../models/index.js";

export default () => db.sequelize.sync({
    force: false
}).then(() => {
    console.log(`🌸 | BLOSSOM DB ON, ${new Date()}`);
}).catch((err) => {
    console.error(err);
});