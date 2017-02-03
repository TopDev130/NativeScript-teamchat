var platform = require('platform'),
    observable = require('data/observable'),
    appSettings = require('application-settings'),
    localeColl = localStorage.getCollection('locale'),
    Locale;

Locale = function () {
    var me = this,
        version;

    version = appConfig.VERSION_NAME + '_' + appConfig.VERSION_CODE;

    // update locale on every build in dev environment (developer only)
    if (appSettings.getString('locale_last_update') !== version || ENV_DEVELOPMENT) {

        var localeCodes = appConfig.LOCALE_CODES,
            deviceLocale = platform.device.language,
            separatorIndex = deviceLocale.indexOf('-');

        // device locale code may not match with our code
        // for example en could be en-US based on platform / device
        // match it with our local code
        if (separatorIndex !== -1) {
            deviceLocale = deviceLocale.substr(0, separatorIndex);
        }

        var selectedItem = localeColl.find({ selected: true }, { $limit: 1, $sort: { version: -1 } })[0] || {},
            selectedCode = _.indexOf(localeCodes, selectedItem.code) !== -1 && selectedItem.code;

        // if none selected, set default one
        // happens on first launch
        if (!selectedCode) {
            selectedCode = _.indexOf(localeCodes, deviceLocale) !== -1 && deviceLocale || appConfig.DEFAULT_LOCALE_CODE;
        }

        // flush on app update
        localeColl.clear();

        // load all locales to db
        _.each(localeCodes, function (code) {
            localeColl.save(_.extend(require('~/i18n/' + code), { selected: code === selectedCode }));
        });
        localeColl.commit();

        // mark as updated
        appSettings.setString('locale_last_update', version);
    }

    me._observable = new observable.Observable();

    me.updateSelection();
};

Locale.prototype.setSelection = function (code) {
    var me = this,
        doc = localeColl.find({ code: code }, { $limit: 1, $sort: { version: -1 } })[0];

    if (doc) {
        // unselect anything previously selected
        localeColl.update({ selected: true }, { $set: { selected: false } });

        // select given locale
        doc.selected = true;
        localeColl.commit();

        // update collection
        me.updateSelection();
        return true;
    }
    return false;
};

Locale.prototype.updateSelection = function () {
    var me = this,
        doc = localeColl.find({ selected: true }, { $limit: 1, $sort: { version: -1 } })[0],
        observable = me._observable,
        data = _.cloneDeep(doc);

    me._data = data;
    _.each(data, function (value, key) {
        observable.set(key, value);
    });
};

Locale.prototype.asObject = function () {
    return this._data;
};

Locale.prototype.asObservable = function () {
    return this._observable;
};

module.exports = global.locale = new Locale();