const { Readable } = require('stream');
const config = require('config');
const { Storage }  = require('@tweedegolf/storage-abstraction');
class BlobStorage {

  /**
   * 
   * @param {*} options 
   */

  constructor(options) {
    this.options = { ...options }
    this.s = new Storage(config.get('storage.url'));
    this.init = this.s.init().then(() => this.s.test());
  }
/**
 * 
 * @param {string} name File name within the default bucket
 * @returns {Promise => Buffer} 
 */
  async fetch(name) {
    await this.init;
    if (await this.s.fileExists(name)) {
      let stream = await this.s.getFileAsReadable(name);
      return new Promise((resolve, reject) => {
        const _buf = [];
        stream.on("data", (chunk) => _buf.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(_buf)));
        stream.on("error", (err) => reject(err));
      });
    }
    else {
      return false;
    }
  }

  async save(name, buffer) {
    await this.init;
    const stream = Readable.from(buffer);
    return this.s.addFileFromReadable(stream, name);
  }

  async remove(name) {
    await this.init;
    return this.s.removeFile(name);
  }

}

module.exports = BlobStorage;