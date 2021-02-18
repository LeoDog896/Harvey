import { Client } from "discord.js";
import {Service} from "../Service";
import * as http from "http";
import Harvey from "../../index";
import {InvalidOperationError} from "common-errors";
import fileStream from "fs";
import {minify} from "html-minifier";
import Mustache from "mustache";
import * as monk from "monk";

export class VerificationService extends Service {

    private isRunning: boolean = false;
    private client: Client | undefined;
    private webServer: http.Server | undefined;
    private template: string | undefined;
    private PORT: number = 8080;

    constructor() {
        super();
        if(process.env.VERIFICATION_PORTAL_PORT === undefined) {
            throw new InvalidOperationError('Verification portal port was invalid.');
        }
        this.PORT = parseInt(process.env.VERIFICATION_PORTAL_PORT);
    }

    isServiceRunning(): boolean {
        return this.isRunning;
    }

    start(client: Client): void {
        this.isRunning = true;
        this.client = client;

        this.webServer = http.createServer(
            (req, res) => this.handleRequest(req, res)
        );

        // Load the template and minify
        let fileContents = fileStream.readFileSync('./templates/verification_portal/verification_portal.mustache', 'utf-8');
        this.template = minify(fileContents);

        this.webServer.listen(this.PORT, () => {
            Harvey.LOGGER.debug(`Verification Service webserver is listening on port ${this.PORT}.`);
        });
    }

    handleRequest(request: http.IncomingMessage, response: http.ServerResponse) {
        Harvey.LOGGER.debug('Handling incoming request to the verification service.');

        const urlObject = new URL(<string>request.url, `http://localhost:${this.PORT}`);
        const params = urlObject.searchParams;
        const code = params.get('c');

        if(code === null) {
            Harvey.LOGGER.error('Verification Service. The code was invalid (400).');
            response.writeHead(400, {"Content-Type": "text/html"});
            response.write('<p>Invalid verification code.</p>');
            response.end()
            return;
        }

        const database = monk.default('mongo_database/testDB');

        const users = database.get('users');
        users.findOne({verify_id: code}).then(doc => {
            let renderedHtml = '';

            if(doc === null) {
                throw new InvalidOperationError('Invalid validation code.');
            }

            // Render the template
            if (this.template != null) {
                renderedHtml = Mustache.render(this.template, {username: doc.username});
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(renderedHtml);
            } else {
                Harvey.LOGGER.error('Verification Service. The template was null. Responding with internal error (500).');
                response.writeHead(500, {"Content-Type": "text/html"});
                response.write('<h1>There was an internal error. Please notify the server admins.</h1>');
            }

            // Add the user to the role
            // message.guild?.member(message.author)?.roles.add('808495503763308556');


        }).catch(err => {
            Harvey.LOGGER.error('Internal err.', err);
            response.writeHead(500, {"Content-Type": "text/html"});
            response.write('<h1>There was an internal error. Please notify the server admins if the issue persists.</h1>');
        }).finally(() => {
            response.end();
            database.close();
        });
    }

    stop(): void {
        this.isRunning = false;
        if(this.webServer !== undefined && this.webServer.listening) {
            Harvey.LOGGER.debug('Shutting down verification service webserver.');
            this.webServer.close(err => {
                Harvey.LOGGER.error('Verification service failed to correctly shut down.\n', err);
            });
        }
    }

}