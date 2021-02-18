import {InvalidOperationError, NotImplementedError, NotPermittedError} from "common-errors";
import { Message, MessageEmbed } from "discord.js";
import { Controller } from "../../Controller";
import Mailgun from "mailgun-js";
import Harvey from "../../../index";
import fileStream from 'fs';
import {minify} from "html-minifier";
import Mustache from "mustache";
import * as monk from "monk";
import { v4 as uuidv4 } from 'uuid';

export class TestEmail extends Controller {
    execute(data: Map<string, any>): void {
        const message: Message = data.get('message');

        if(message.author.id !== "244216677854609410") {
            Harvey.LOGGER.debug(`${message.author.username} is not allowed to run this command.`);
            throw new NotPermittedError('You can not execute this command unless you are Yooogle.');
        }

        // Check to make sure the given email is valid

        // Connect to database
        const database = monk.default('mongo_database/testDB');
        const users = database.get('users');
        const code = uuidv4();

        users.insert({
            discord_id: message.author.id,
            username: message.author.username,
            verify_id: code
        }).then(() => {

            if( process.env.MAILGUN_API_KEY === undefined ||
                process.env.MAILGUN_BASE_URL === undefined ||
                process.env.VERIFY_EMAIL_PREFIX === undefined ) {
                Harvey.LOGGER.error('Mailgun config was invalid. Abort.');
                Harvey.LOGGER.debug(`
                Is API key undefined: ${process.env.MAILGUN_API_KEY === undefined} | 
                Is base URL undefined: ${process.env.MAILGUN_BASE_URL === undefined} |
                Is email verify prefix undefined: ${process.env.VERIFY_EMAIL_PREFIX === undefined}`);
                throw new InvalidOperationError('Mailgun config was invalid.');
            }

            // Load the email template
            let fileContents = fileStream.readFileSync('./templates/verification_email/verification.mustache', 'utf-8');
            let minifiedFileContents = minify(fileContents);
            let renderedHtml = Mustache.render(minifiedFileContents, { verification_code: code });

            const mailgun = new Mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_BASE_URL});
            const email = {
                from: `Computer Science Discord <${process.env.VERIFY_EMAIL_PREFIX}@harvey.yooogle.co>`,
                to: "jdesante@odu.edu, joeldesante@gmail.com",
                subject: "Please verify your account.",
                html: renderedHtml
            }

            mailgun.messages().send(email).then(r => {
                Harvey.LOGGER.info(`Sent verification email to jdesante@odu.edu.`);
                message.channel.send('Sent Email.');
            });
        }).catch(err => {
            Harvey.LOGGER.error('Failed to save to database.', err);
        }).finally(() => {
            database.close();
        });
    }
}