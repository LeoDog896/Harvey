module.exports = class ReactionListener {

    /**
     * @param client
     * @param reaction
     * @param onReaction
     */
    constructor(client, reaction, onReaction) {
        client.on('messageReactionAdd', function (messageReaction, user) {
            if(messageReaction.emoji.name !== reaction) { return; }
            onReaction(messageReaction, user);
        });
    }

}