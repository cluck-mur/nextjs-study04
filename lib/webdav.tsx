/**
 * WebDAV リモート接続
 */
import { createClient } from "webdav";
import fs from "fs";

type webdav_config = {
    host: string;
    port: string;
    user: string;
    password: string;
}

// const webdavConfig: webdav_config; = {
//     host: process.env.WEBDAV_HOST,
//     port: process.env.WEBDAV_PORT,
//     user: process.env.WEBDAV_USER,
//     password: process.env.WEBDAV_PASSWORD
// }

const client = createClient(
    `${process.env.WEBDAV_HOST}:${process.env.WEBDAV_PORT}`,
    {
        username: process.env.WEBDAV_USER,
        password: process.env.WEBDAV_PASSWORD
    }
)

export default class WebDav {
    /**
     * メンバ変数
     */
    protected webdavConfig: webdav_config;
    protected client;

    /**
     * コンストラクター
     */
    constructor() {
        this.webdavConfig = {
            host: process.env.WEBDAV_HOST,
            port: process.env.WEBDAV_PORT,
            user: process.env.WEBDAV_USER,
            password: process.env.WEBDAV_PASSWORD
        }

        this.client = createClient(
            `${this.webdavConfig.host}:${this.webdavConfig.port}`,
            {
                username: this.webdavConfig.user,
                password: this.webdavConfig.password
            }
        )
    }

    /**
     * createWriteStream
     * @param path 
     */
    public async createWriteStream(path: string) {
        let fs = this.client.createWriteStream(path);
        return fs;
    }

    /**
     * exists
     * @param path 
     */
    public async exists(path: string) {
        let result: boolean = await this.client.exists(path);
        return result;
    }

    /**
     * getFileDownloadLink
     */
    public getFileDownloadLink(file: string): string {
        let download_link: string = client.getFileDownloadLink(file);
        return download_link;
    }
}