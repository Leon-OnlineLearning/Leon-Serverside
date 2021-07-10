import axios from "axios";

export enum supportedPlugins {
    audio = "audiobridge",
    data = "textroom"
}

export default class JanusConnection {


    private _session_id: number | undefined;
    public get session_id(): number | undefined {
        return this._session_id;
    }

    private _handler_id: number | undefined;
    public get handler_id(): number | undefined {
        return this._handler_id;
    }


    private get pluginLink(): string {
        return `${this.janus_server}/${this._session_id}/${this._handler_id}`
    }

    constructor(public janus_server: string, public plugin: supportedPlugins) {

    }

    async initialize() {
        this._session_id = await this.create_session(this.janus_server)

        this._handler_id = await this.attach_plugin(`janus.plugin.${this.plugin}`)

    }

    async create_room(
        roomId: number,
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
            url: this.pluginLink,
            data: create_room_request,
        });
        if (res.data.janus != "success") {
            throw new Error("cannot create room");
        }
        const is_audio_already_exist = res.data.plugindata.error_code == 486 &&
            res.data.audiobridge

        const is_data_already_exist = res.data.plugindata.error_code == 418 &&
            res.data.textroom

        if (is_audio_already_exist || is_data_already_exist) {
            console.info(`room already exist with id ${roomId}`);
            return
        }


        console.info(`room created successfully with id ${roomId}`);
    }


    async end_room(
        roomId: number,
        room_secret: string) {
        const destroy_room_request = {
            janus: "message",
            transaction: random_string(12),
            body: {
                "request": "destroy",
                "room": roomId,
                "secret": room_secret,
            }
        }
        const res = await axios({
            method: "POST",
            url: this.pluginLink,
            data: destroy_room_request,
        });
        if (res.data.janus != "success") {
            throw new Error("cannot destroy room");
        }
        if (res.data.plugindata?.error_code) {
            throw new Error(`plugin throw error ${res.data.plugindata?.error_code}`);
        }

        console.info(`room destroyed with id ${roomId}`)
    }

    async destroy(): Promise<void> {

        await this.destroy_plugin_attach()
        this._handler_id = undefined

        await this.destroy_session()
        this._session_id = undefined

    }


    async getJanusInfo(janus_server: string) {
        let res = await axios({
            method: "get",
            url: `${janus_server}/info`,
        });
        console.log(res.data);
        if (res.data.janus != "success") {
            throw new Error("cannot create room");
        }
    }

    private async create_session(janus_server: string) {
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
        return session_id;
    }

    private async attach_plugin(
        plugin_name: string
    ) {
        const attach_msg = {
            janus: "attach",
            plugin: plugin_name,
            transaction: random_string(12),
        };
        let res = await axios({
            method: "POST",
            url: `${this.janus_server}/${this._session_id}`,
            data: attach_msg,
        });
        if (res.data.janus != "success") {
            throw new Error("cannot attach to plugin");
        }

        const attachment_id = res.data.data.id;
        console.debug(`attach to plugin ${plugin_name} with id ${attachment_id}`);
        return attachment_id;
    }

    private async destroy_session() {
        const destroy_msg = {
            janus: "destroy",
            transaction: random_string(12),
        };
        let res = await axios({
            method: "post",
            url: `${this.janus_server}/${this.session_id}`,
            data: destroy_msg,
        });
        if (res.data.janus != "success") {
            throw new Error("cannot destroy session");
        }
    }

    private async destroy_plugin_attach() {
        const destroy_msg = {
            janus: "detach",
            transaction: random_string(12),
        };
        let res = await axios({
            method: "POST",
            url: this.pluginLink,
            data: destroy_msg,
        });
        if (res.data.janus != "success") {
            throw new Error("cannot destroy attachment");
        }
    }
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