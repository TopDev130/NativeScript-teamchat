var Logger;

Logger = function (enabled) {
    this.enabled = enabled;
};

Logger.prototype.dir = function () {
    this.print('dir', _.toArray(arguments));
};

Logger.prototype.dump = function () {
    this.print('dump', _.toArray(arguments));
};

Logger.prototype.trace = function () {
    this.print('trace', _.toArray(arguments));
};

Logger.prototype.info = function () {
    this.print('info', _.toArray(arguments));
};

Logger.prototype.warn = function () {
    this.print('warn', _.toArray(arguments));
};

Logger.prototype.error = function () {
    this.print('error', _.toArray(arguments));
};

Logger.prototype.log = function () {
    this.print('log', _.toArray(arguments));
};

Logger.prototype.print = function (level, data) {
    if (this.enabled) {
        data = _.map(data, function (item) {
            if (_.isObject(item)) {
                return JSON.stringify(item, null, 4);
            }
            return item;
        });
        console[level || 'info'].apply(console, data);
    }
};

module.exports = global.logger = new Logger(appConfig.ENABLE_LOGGER);