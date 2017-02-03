var Scule = require('sculejs'),
    filesystem = require('file-system'),
    LocalStorage;

LocalStorage = function () {
    // clear cache if true
    if (appConfig.CLEAR_CACHE) {
        filesystem.knownFolders.documents().getFolder(appConfig.DATA_CACHE_PATH).getEntitiesSync().forEach(function (entity) {
            entity.removeSync();
        });
    }
    Scule.registerStorageEngine('nsapp', require('~/utils/AppStorageEngine'));
};

LocalStorage.prototype.getCollection = function (name) {
    return Scule.factoryCollection('scule+nsapp://' + name);
};

module.exports = global.localStorage = new LocalStorage();