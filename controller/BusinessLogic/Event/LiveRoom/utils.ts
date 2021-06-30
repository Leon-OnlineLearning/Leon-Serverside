import axios from "axios";

/**
 * create a room in janus server
 * @param roomId
 * @param jansus_server url
 * @param room_secret required for modifing/destroying the room
 * @param join_pin password to join room
 * @param save_location recording location in janus container
 */
export async function start_janus_room(
    roomId: number,
    jansus_server: string,
    room_secret: string,
    join_pin: string,
    save_location: string
) {
    const session_id = await create_session(jansus_server);
    const attaching_audio_id = await attach_plugin(
        jansus_server,
        session_id,
        "janus.plugin.audiobridge"
    );
    const attaching_data_id = await attach_plugin(
        jansus_server,
        session_id,
        "janus.plugin.textroom"
    );

    // create audio room
    _create_room_plugin(
        roomId,
        jansus_server,
        session_id,
        attaching_audio_id,
        room_secret,
        join_pin,
        save_location
    );

    //create data room
    _create_room_plugin(
        roomId,
        jansus_server,
        session_id,
        attaching_data_id,
        room_secret,
        join_pin,
        save_location
    );

    destroy_plugin_attach(jansus_server, session_id, attaching_audio_id);
    destroy_plugin_attach(jansus_server, session_id, attaching_data_id);

    destroy_session(jansus_server, session_id);
    console.log(session_id);
}

export async function _create_room_plugin(
    roomId: number,
    janus_server: string,
    sessino_id: number,
    attachment_id: number,
    room_secret: string,
    join_pin: string,
    save_location: string
) {
    const create_room_request = {
        janus: "message",
        transaction: random_string(12),
        body: {
            request: "create",
            room: roomId,
            secret: room_secret,
            // pin:join_pin
            is_private: true,
            record: true,
            record_file: save_location,
        },
    };
    const res = await axios({
        method: "POST",
        url: `${janus_server}/${sessino_id}/${attachment_id}`,
        data: create_room_request,
    });
    console.debug(res.data);
}

export function random_string(len: number) {
    var charSet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var randomString = "";
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

export async function getJanusInfo(jansus_server: string) {
    let res = await axios({
        method: "get",
        url: `${jansus_server}/info`,
    });
    console.log(res.data);
}

export async function create_session(janus_server: string) {
    let res = await axios({
        method: "POST",
        url: janus_server,
        data: {
            janus: "create",
            transaction: random_string(12),
        },
    });
    if (res.data.janus != "success") {
        throw new Error("cannot create session");
    }

    const session_id = res.data.data.id as number;
    console.debug(`session created with id ${session_id}`);
    return session_id;
}

export async function attach_plugin(
    janus_server: string,
    session_id: number,
    plugin_name: string
) {
    const attach_msg = {
        janus: "attach",
        plugin: plugin_name,
        transaction: random_string(12),
    };
    let res = await axios({
        method: "POST",
        url: `${janus_server}/${session_id}`,
        data: attach_msg,
    });
    if (res.data.janus != "success") {
        throw new Error("cannot attach to plugin");
    }

    const attachment_id = res.data.data.id;
    console.debug(`attach to plugin ${plugin_name} with id ${attachment_id}`);
    return attachment_id;
}

export async function destroy_session(
    janus_server: string,
    session_id: number
) {
    const destroy_msg = {
        janus: "destroy",
        transaction: random_string(12),
    };
    let res = await axios({
        method: "post",
        url: `${janus_server}/${session_id}`,
        data: destroy_msg,
    });

    console.debug(res.data);
}

export async function destroy_plugin_attach(
    janus_server: string,
    session_id: number,
    attach_id: number
) {
    const destroy_msg = {
        janus: "detach",
        transaction: random_string(12),
    };
    let res = await axios({
        method: "POST",
        url: `${janus_server}/${session_id}/${attach_id}`,
        data: destroy_msg,
    });
    console.debug(res.data);
}
