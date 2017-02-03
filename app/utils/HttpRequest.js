var http = require('http'),
    connectivity = require('connectivity'),
    userColl = localStorage.getCollection('user');

function HttpRequest(config) {
    var apiConfig = _.defaultsDeep(_.cloneDeep(appConfig.API_METHODS[config.method]), appConfig.API_DEFAULTS),
        url = appConfig.BASE_URL.concat(apiConfig.URL),
        method = apiConfig.METHOD,
        headers = _.extend(apiConfig.HEADERS, config.headers),
        pathVars = config.pathVars,
        params = config.params || {},
        lstrings = locale.asObject(),
        userDoc = userColl.findAll()[0];

    if (pathVars) {
        url = stringFormatter.formatArray(url, pathVars);
    }

    if (userDoc) {
        headers.Authorization = userDoc.authorization_token;
    }

    if (config.busy !== false) {
        uiHelper.showLoader();
    }

    logger.info('request', url, method, headers, params);

    function onSuccess(responseOpts) {
        var statusCode = responseOpts.statusCode,
            responseHeaders = responseOpts.headers,
            result = responseOpts.content.toJSON();

        logger.info('response', statusCode, result);
        if (statusCode === appConfig.API_STATUS_CODES.SUCCESS) {
            if (responseHeaders) {
                // Authorization token, will be sent with subsequent requests 
                var token = responseHeaders.Token;
                if (token) {
                    result.authorization_token = 'BEARER ' + token;
                }
            }
            if (config.keepBusy !== true) {
                uiHelper.hideLoader();
            }
            return result;
        }
        throw new Error(result.message);
    }

    function onError(err) {
        logger.error('failure', err);
        uiHelper.hideLoader();
        if (config.alertUser !== false) {
            return dialogs.alert({
                title: lstrings.app_name,
                message: err.message || lstrings.msg_unknown_error,
                okButtonText: lstrings.btn_ok
            }).then(function () {
                throw err;
            });
        }
        throw err;
    }

    function onReady() {
        var requestOpts = {
            url: url,
            method: method,
            headers: headers,
            timeout: apiConfig.TIMEOUT
        };
        if (method === "POST") {
            requestOpts.content = JSON.stringify(params);
        }
        return http.request(requestOpts);
    }

    return new Promise(function (resolve, reject) {
        if (connectivity.getConnectionType() !== connectivity.connectionType.none) {
            resolve();
        } else {
            reject(new Error(lstrings.msg_offline));
        }
    }).then(onReady).then(onSuccess).catch(onError);
};

module.exports = global.HttpRequest = HttpRequest;