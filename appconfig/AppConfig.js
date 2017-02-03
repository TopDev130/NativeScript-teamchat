var AppConfig = {
    "ENABLE_LOGGER": true,
    "GCM_SENDER_ID": "980605553126",
    "STATIC_KEY": "DN6SIZeP",
    "DATA_CACHE_PATH": "db",
    "IMAGE_CACHE_PATH": "images",
    "CLEAR_CACHE": false,
    "DEFAULT_LOCALE_CODE": "en",
    "LOCALE_CODES": [
        "en"
    ],
    "BASE_URL": "https://staging.i.justplunk.com/api/v3/",
    "API_DEFAULTS": {
        "METHOD": "POST",
        "HEADERS": {
            "Content-Type": "application/json"
        },
        "TIMEOUT": 60000
    },
    "API_METHODS": {
        "USER_LOGIN": {
            "URL": "users/login"
        },
        "USER_INFO": {
            "URL": "users/initial_load",
            "METHOD": "GET"
        },
        "USER_LOGOUT": {
            "URL": "users/logout"
        },
        "CHANNEL_GET": {
            "URL": "teams/{0}/channels/",
            "METHOD": "GET"
        },
        "POST_GET": {
            "URL": "teams/{0}/channels/{1}/posts/page/{2}/{3}",
            "METHOD": "GET"
        }
    },
    "API_STATUS_CODES": {
        "SUCCESS": 200
    },
    "API_CONSTANTS": {
        "PROFILE_IMAGE_URL": {
            "SYSTEM": "{0}users/{1}/image",
            "USER": "https://s3.amazonaws.com/plunk-test/users/{0}/{0}.png"
        },
        "PROFILE_IMAGE_TYPE": {
            "SYSTEM": "no",
            "USER": "yes"
        },
        "POST_GET_LIMIT": 20,
        "CHANNEL_TYPES": {
            "PUBLIC": "O",
            "PRIVATE": "P",
            "DIRECT": "D"
        },
        "PREFERENCE_TYPES": {
            "LAST": "last",
            "DIRECT": "direct_channel_show"
        }
    },
    "STYLE": {
        "PRIMARY_COLOR": "#62AAF8",
        "PRIMARY_DARK_COLOR": "#4476AD"
    }
};

module.exports = AppConfig;