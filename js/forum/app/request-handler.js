var requestHandler = {

    ajaxRequest: function (requestUrl, requestData, callback, async) {
        if (async === undefined)
            async = true;
        newRequestUrl = '/' + getForumPrefix().substring(0, getForumPrefix().length - 1) + requestUrl;
        $.ajax({
            type: 'POST',
            url: newRequestUrl,
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            dataType: 'json',
            async: async,
            statusCode: {
                403: function() {
                    console.error('[request-handler] 403 Forbidden! Request: ' + newRequestUrl);
                    Utils.notify('Ошибка доступа', 'error');
                    $('button').button('reset');
                },
                404: function() {
                    console.error('[request-handler] 404 Not Found! Request: ' + newRequestUrl);
                    Utils.notify('Функция не найдена', 'error');
                    $('button').button('reset');
                },
                408: function() {
                    console.error('[request-handler] 408 Request Timeout! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                },
                500: function() {
                    console.error('[request-handler] 500 Internal Server Error! Request: ' + newRequestUrl);
                    Utils.notify('Внутренняя ошибка сервера<br>Повторите запрос позже', 'error');
                    $('button').button('reset');
                },
                502: function () {
                    console.error('[request-handler] 502 Bad Gateway! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                },
                503: function () {
                    console.error('[request-handler] 503 Service Unavailable! Request: ' + newRequestUrl);
                    Utils.notify('Внутренняя ошибка сервера<br>Повторите запрос позже', 'error');
                    $('button').button('reset');
                },
                504: function () {
                    console.error('[request-handler] 504 Gateway Timeout! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                }
            },
            success: function(json) {
                if (json !== undefined)
                    if (!requestHandler.processResponse(json) && typeof callback === 'function')
                        callback(json);
            }
        });
    },

    sendFormData: function (requestUrl, requestData, callback) {
        newRequestUrl = '/' + getForumPrefix().substring(0, getForumPrefix().length - 1) + requestUrl;
        $.ajax({
            type: 'POST',
            url: newRequestUrl,
            data: requestData,
            async: true,
            processData: false,
            contentType: false,
            statusCode: {
                403: function() {
                    console.error('[request-handler] 403 Forbidden! Request: ' + newRequestUrl);
                    Utils.notify('Ошибка доступа', 'error');
                    $('button').button('reset');
                },
                404: function() {
                    console.error('[request-handler] 404 Not Found! Request: ' + newRequestUrl);
                    Utils.notify('Функция не найдена', 'error');
                    $('button').button('reset');
                },
                408: function() {
                    console.error('[request-handler] 408 Request Timeout! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                },
                500: function() {
                    console.error('[request-handler] 500 Internal Server Error! Request: ' + newRequestUrl);
                    Utils.notify('Внутренняя ошибка сервера<br>Повторите запрос позже', 'error');
                    $('button').button('reset');
                },
                502: function () {
                    console.error('[request-handler] 502 Bad Gateway! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                },
                503: function () {
                    console.error('[request-handler] 503 Service Unavailable! Request: ' + newRequestUrl);
                    Utils.notify('Внутренняя ошибка сервера<br>Повторите запрос позже', 'error');
                    $('button').button('reset');
                },
                504: function () {
                    console.error('[request-handler] 504 Gateway Timeout! Request: ' + newRequestUrl);
                    Utils.notify('Проблемы с соединением', 'error');
                    $('button').button('reset');
                }
            },
            success: function(json) {
                if (json !== undefined)
                /* We can't use this.processResp... due to closure {} */
                    if (!requestHandler.processResponse(json))
                        callback(json);
            }
        });
    },

    processResponse: function (response) {
        if (response === undefined) {
            console.log('[request] response don\'t have status');
            return false;
        }
        switch (response.status) {
            case 'invalidRequest':
                return Utils.notify('Ошибка при выполнении запроса', 'warning');
            case 'unauthorized':
                return Utils.notify('Не выполнен вход или истекла сессия', 'warning');
            case 'userNotActivated':
                return Utils.notify('Пользователь не активирован', 'warning', 5000);
            case 'userSuspended':
                return Utils.notify('Установлен режим только чтение', 'warning', 5000);
            case 'accessDenied':
                if (response.message !== undefined)
                    return Utils.notify(response.message, 'warning', 6000);
                return Utils.notify('В доступе отказано', 'warning', 6000);
            case 'maintenance':
                return Utils.notify('Ведутся технические работы<br>Сайт скоро станет доступен', 'warning', 5000);
            case 'error':
                if (response.code !== undefined)
                    return Utils.notify('Произошла ошибка<br>Код ошибки: ' + response.code, 'error', 6000);
                else if (response.message !== undefined && response.message.trim().length > 0)
                    return Utils.notify(response.message, 'warning', 6000);
                else
                    return Utils.notify('Произошла ошибка<br>Повторите попытку позже', 'error', 6000);
            default:
                return false;
        }
    }

};