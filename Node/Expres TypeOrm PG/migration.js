const path = require('path');
const fs = require('fs');
const colors = require('bumburum');
global.Promise = require("bluebird");

async function migration() {
    try {
        const dbConnection = await require("./db/mongo.js");
        console.log(`Connected to mongoDB ${colors.font.Green}`, 'successfully');
        global.APP_CONFIG = require('./config/');
        global.APP_CONSTS = require('./core/helpers/const/');
        global.Errors = require('./core/Errors');
        global.Mailer = require('./core/mailer/');
        global.APP_MODELS = require('./db/models');

        // scan migrations directory
        const migrationsDirectory = path.resolve('./db/migrations');
        const files = fs.readdirSync(migrationsDirectory);

        const {Migrations} = APP_MODELS;

        for (let i in files) {
            const file = files[i];
            const lasMigration = await Migrations.findOne({fileName: file});

            if (lasMigration) {
                console.log(`Skip migration: ${colors.font.Blue}`, file);
            } else {

                try {
                    console.log(`Try to execute migration: ${colors.font.Blue}`, file);
                    const _migrationPath = path.resolve(`./db/migrations/${file}`);

                    const _migration = require(_migrationPath);
                    await _migration();

                    console.log(`Migration result: ${colors.font.Blue}, status: ${colors.font.Green}`, file, 'success');

                    await Migrations.insert({fileName: file});
                } catch (e) {
                    console.error(`Something went wrong with migration (file: ${colors.font.Blue})`, file);
                    console.log(e);
                }
            }
        }

        await dbConnection.disconnect();
    } catch (e) {
        console.log(e);
        throw e;
    }
}

migration();
