var Crypto = require('crypto-js'),
    AppUtils;

AppUtils = function () { };

AppUtils.prototype.random = function (length) {
    var text = "",
        possible = "0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

AppUtils.prototype.md5 = function (data) {
    return Crypto.HmacMD5(data, appConfig.STATIC_KEY).toString();
};

AppUtils.prototype.encrypt = function (data) {
    var dynamicKey = Crypto.enc.Utf8.parse(this.random(8)),
        iv = Crypto.lib.WordArray.random(16),
        secret = Crypto.enc.Hex.parse(appConfig.STATIC_KEY).concat(dynamicKey),
        result = Crypto.AES.encrypt(data, secret, {
            iv: iv
        });
    return Crypto.enc.Base64.stringify(dynamicKey.concat(iv).concat(result.ciphertext));
};

AppUtils.prototype.decrypt = function (data) {
    try {
        // 1 char = 2 bytes
        var cipherText = Crypto.enc.Base64.parse(data).toString(),
            secret = Crypto.enc.Hex.parse(appConfig.STATIC_KEY.concat(cipherText.substring(0, 16))),
            iv = Crypto.enc.Hex.parse(cipherText.substring(16, 48)),
            result = Crypto.AES.decrypt({ ciphertext: Crypto.enc.Hex.parse(cipherText.substring(48)) }, secret, {
                iv: iv
            });
        return result.toString(Crypto.enc.Utf8);
    } catch (err) {
        logger.error('Failed to decrypt', err);
        return '';
    }
};

module.exports = global.appUtils = new AppUtils();