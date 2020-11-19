/**
 * WebDAV リモート接続
 */
import { createClient } from "webdav";
import fs, { WriteStream, ReadStream } from "fs";

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

// const client = createClient(
//     `${process.env.WEBDAV_HOST}:${process.env.WEBDAV_PORT}`,
//     {
//         username: process.env.WEBDAV_USER,
//         password: process.env.WEBDAV_PASSWORD
//     }
// )

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
     * copyFile
     * 詳しくは https://www.npmjs.com/package/webdav を参照。

     * リモートサーバ内でファイルをコピーする
     * @param from_path 
     * @param to_path 
     */
    public async copyFile(from_path: string, to_path: string): Promise<void> {
        await this.client.copyFile(from_path, to_path)
    }

    /**
     * createDirectory
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * リモートサーバ内でディレクトリを作る
     * @param path 
     */
    public async createDirectory(path: string): Promise<void> {
        await this.client.createDirectory(path);
    }

    /**
     * createReadStream
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * @param path 
     */
    public async createReadStream(path: string): Promise<ReadStream> {
        let fs: ReadStream = await this.client.createReadStream(path);
        return fs;
    }

    /**
     * createWriteStream
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * @param path 
     */
    public async createWriteStream(path: string): Promise<WriteStream> {
        let fs:WriteStream = await this.client.createWriteStream(path);
        return fs;
    }

    /**
     * deleteFile
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * @param path 
     */
    public async deleteFile(path: string): Promise<void> {
        await this.client.deleteFile(path);
    }

    /**
     * exists
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * @param path 
     */
    public async exists(path: string): Promise<boolean> {
        let result: boolean = await this.client.exists(path);
        return result;
    }

    /**
     * getDirectoryContents
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Get the contents of a remote directory. Returns an array of item stats.
     * 
     *  // Get current directory contents:
     *  const contents = await client.getDirectoryContents("/");
     * 
     *  // Get all contents:
     *  const contents = await client.getDirectoryContents("/", { deep: true });
     * 
     *  // Files can be globbed using the glob option (processed using minimatch).
     *  // When using a glob pattern it is recommended to fetch deep contents:
     * 
     *  const images = await client.getDirectoryContents("/", { deep: true,  glob: "／＊＊／＊.{png,jpg,gif}" }); 
     * 
     * @param path 
     * @param object 
     */
    public async getDirectoryContents(path: string, object = null): Promise<any[]> {
        let contents: any[] = await this.client.getDirectoryContents(path);
        return contents;
    }

    /**
     * getFileContents
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Fetch the contents of a remote file. Binary contents are returned by default (Buffer):
     * 
     *  const buff = await client.getFileContents("/package.zip");
     *  It is recommended to use streams if the files being transferred are large.
     * 
     * Text files can also be fetched:
     * 
     *  const str = await client.getFileContents("/config.json", { format: "text
     * 
     * @param path 
     */
    public async getFileContents(path: string): Promise<any> {
        let buff = await this.client.getFileContents(path);
        return buff;
    }

    /**
     * getFileDownloadLink
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Return a public link where a file can be downloaded.
     * This exposes authentication details in the URL.
     * 
     *  const downloadLink = client.getFileDownloadLink("/image.png");
     * 
     * Not all servers may support this feature.
     * Only Basic authentication and unauthenticated connections support this method.
     */
    public async getFileDownloadLink(path: string): Promise<string> {
        let download_link: string = await this.client.getFileDownloadLink(path);
        return download_link;
    }

    /**
     * getFileUploadLink
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Return a URL for a file upload:
     * 
     *  const uploadLink = client.getFileUploadLink("/image.png");
     * 
     * See getFileDownloadLink for support details.
     * 
     * @param path 
     */
    public async getFileUploadLink(path: string): Promise<string> {
        let upload_link = await this.client.getFileUploadLink(path);
        return upload_link;
    }

    /**
     * getQuota
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Get the quota information for the current account:
     * 
     *  const quota = await client.getQuota();
     *  // {
     *  //     "used": 1938743,
     *  //     "available": "unlimited"
     *  // }
     * 
     */
    public async getQuota(): Promise<any> {
        let quota = await this.client.getQuota();
        return quota;
    }

    /**
     * putFileContents
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Write data to a remote file:
     * 
     *  // Write a buffer:
     *  await client.putFileContents("/my/file.jpg", imageBuffer, { overwrite: false });
     *  // Write a text file:
     *  await client.putFileContents("/my/file.txt", str);
     * 
     * Specify the maxBodyLength option to alter the maximum number of bytes the client can send in the request. NodeJS only.
     * 
     * Handling Upload Progress (browsers only):
     * This uses the axios onUploadProgress callback which uses the native XMLHttpRequest progress event.
     * 
     *  // Upload a file and log the progress to the console:
     *  await client.putFileContents("/my/file.jpg", imageFile, { onUploadProgress: progress => {
     *      console.log(`Uploaded ${progress.loaded} bytes of ${progress.total}`);
     *  } });
     *  
     * @param path 
     * @param any 
     * @param object 
     */
    public async putFileContents(path: string, any = null, object = null): Promise<any> {
        await this.client.putFileContents(path, any, object);
    }

    /**
     * stat
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Get a file or directory stat object
     * 
     * @param path 
     * @param object 
     */
    public async stat(path: string, object = null): Promise<any> {
        let stat = await this.client.stat(path);
        return stat;
    }

    /**
     * customRequest
     * 詳しくは https://www.npmjs.com/package/webdav を参照。
     * 
     * Custom requests can be made to the attached host
     * 
     * @param path 
     * @param object 
     */
    public async customRequest(path: string, object): Promise<any> {
        let contents = await this.client.customRequest(path, object);
        return contents;
    }
}
