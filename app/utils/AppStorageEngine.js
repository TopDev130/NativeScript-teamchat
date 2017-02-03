var Scule = require('sculejs'),
    AppStorageEngine;

AppStorageEngine = function (configuration) {

    this.filesystem = require('file-system');

    Scule.db.classes.StorageEngine.call(this, configuration);

    if (!this.configuration.path) {
        this.configuration.path = this.filesystem.knownFolders.documents().getFolder(appConfig.DATA_CACHE_PATH).path;
    }

    this.setConfiguration = function (configuration) {
        this.configuration = configuration;
        if (!this.configuration.path) {
            this.configuration.path = this.filesystem.knownFolders.documents().getFolder(appConfig.DATA_CACHE_PATH).path;
        }
    };

    this.setCryptographyProvider(new Scule.db.classes.SimpleCryptographyProvider());

    /**
     * Writes data to storage
     * @public
     * @param {String} name the name of the file to write data to
     * @param {Object} object the data to write
     * @param {Function} callback the callback to execute once writing to storage is complete
     * @returns {Void}
     */
    this.write = function (name, object, callback) {
        if (!object._salt) {
            object._salt = Scule.sha1.hash((new Date()).getTime() + '');
        }
        object._sig = this.crypto.signObject(object, this.configuration.secret, object._salt);
        var realPath = appUtils.md5(name);
        var tmpPath = appUtils.md5(name + '.tmp');
        var file = this.filesystem.File.fromPath(this.filesystem.path.join(this.configuration.path, tmpPath));
        file.writeTextSync(appUtils.encrypt(JSON.stringify(object)));
        // file can not be renamed when one is already exists at same path
        // so delete file (if any) at real path before renaming tmp to real
        var fullRealPath = this.filesystem.path.join(this.configuration.path, realPath);
        if (this.filesystem.File.exists(fullRealPath)) {
            this.filesystem.File.fromPath(fullRealPath).removeSync();
        }
        file.renameSync(realPath);
        if (callback) {
            callback(object);
        }
        return true;
    };

    /**
     * Reads data from storage
     * @public
     * @param {String} name the name of the file to read data from
     * @param {Function} callback the callback to execute one reading from storage is complete
     * @returns {Object}
     */
    this.read = function (name, callback) {
        var realPath = this.filesystem.path.join(this.configuration.path, appUtils.md5(name));
        if (this.filesystem.File.exists(realPath)) {
            var file = this.filesystem.File.fromPath(realPath);
            var o = JSON.parse(appUtils.decrypt(file.readTextSync()) || "{}");
            if (this.crypto.verifyObjectSignature(o, this.configuration.secret, o._salt) === false) {
                return false;
            }
            delete o._sig;
            if (callback) {
                callback(o);
            }
            return o;
        }
        return false;
    };

};

module.exports = AppStorageEngine;