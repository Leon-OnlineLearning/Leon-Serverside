import JanusConnection, { supportedPlugins } from "./janusConnection";

/**
 * create a room in janus server for audio and data plugins
 * @param roomId
 * @param janus_server url
 * @param room_secret required for modifying/destroying the room
 * @param join_pin password to join room
 * @param save_location recording location in janus container
 */
export async function start_janus_room(
    roomId: number,
    janus_server: string,
    room_secret: string,
    join_pin: string,
    save_location: string
) {
    for (let plugin of Object.values(supportedPlugins)) {
        const plugin_connection = new JanusConnection(janus_server, plugin);
        try {
            await plugin_connection.initialize();
            await plugin_connection.create_room(
                roomId,
                room_secret,
                join_pin,
                save_location
            );
        } finally {
            await plugin_connection.destroy();
        }
    }
}

export async function end_janus_room(
    roomId: number,
    janus_server: string,
    room_secret: string
) {
    for (let plugin of Object.values(supportedPlugins)) {
        const plugin_connection = new JanusConnection(janus_server, plugin);
        try {
            await plugin_connection.initialize();
            await plugin_connection.end_room(roomId, room_secret);
        } finally {
            await plugin_connection.destroy();
        }
    }
}
