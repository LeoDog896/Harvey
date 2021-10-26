const jsonfile = require('jsonfile');
const ReactionListener = require('./ReactionListener');

module.exports = class CourseSelector extends ReactionListener {

    /**
     * @param client
     * @param dataPath
     */
    constructor(client, dataPath) {
        super(client, '👍', function (messageResponse, user) {
            console.log("Ayy");
        });

        this.client = client;
        this.dataPath = `${process.cwd()}/${dataPath}`;
        this.cachedMessages = [];

        this.cacheCourseMessages();

    }

    /**
     *
     */
    cacheCourseMessages() {
        this.cachedMessages = [];
        const data = jsonfile.readFileSync(this.dataPath);

        console.dir(data);

        let registeredCourses = data.registeredCourses;
        for(let i = 0; i < registeredCourses.length; i++) {
            const course = registeredCourses[i];
            const channel = this.client.channels.cache.get(course.channelId);
            this.cachedMessages.push(channel.message.cache.get(course.messageId));
        }
    }

}