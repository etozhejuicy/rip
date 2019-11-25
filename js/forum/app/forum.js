/**
 * Various functions
 * @type {{subscribe: Forum.subscribe, unsubscribe: Forum.unsubscribe, read: Forum.read, unread: Forum.unread, upTopic: Forum.upTopic, sendChatMessage: Forum.sendChatMessage, tooltipQuote: Forum.tooltipQuote, insertQuote: Forum.insertQuote, subscribeToUser: Forum.subscribeToUser, unsubscribeFromUser: Forum.unsubscribeFromUser, logout: Forum.logout, getBBCode: (function(*=, *=, *=): string), addWallPostDOM: Forum.addWallPostDOM, toggleHideUserGifAvatar: Forum.toggleHideUserGifAvatar}}
 */
var Forum = {

    subscribe: function(type, id) {
        var btn = $('.subscribe-link');
        var unsubscribeLink = $('.unsubscribe-link');

        btn.button('loading');
        requestHandler.ajaxRequest('/api/forum/subscribe', {
            type: type,
            id: id
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    btn.hide();
                    unsubscribeLink.show();
                    if (type == 'topic')
                        Utils.notify('Вы подписались на обновления темы');
                    break;
                case 'alreadySubscribed':
                    Utils.notify('Вы уже подписаны', 'warning');
                    break;
                case 'invalidForum':
                    Utils.notify('Не корректный форум', 'warning');
                    break;
                case 'invalidTopic':
                    Utils.notify('Не корректный топик<br>Возможно он был удален', 'warning');
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        });
    },

    unsubscribe: function(type, id) {
        var btn = $('.unsubscribe-link');
        var subscribeLink = $('.subscribe-link');

        btn.button('loading');
        requestHandler.ajaxRequest('/api/forum/unsubscribe', {
            type: type,
            id: id
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    btn.hide();
                    subscribeLink.show();
                    if (type == 'topic')
                        Utils.notify('Вы отписались от обновлений темы');
                    break;
                case 'notSubscribed':
                    Utils.notify('Вы не подписаны', 'warning');
                    break;
                case 'invalidForum':
                    Utils.notify('Не корректный форум', 'warning');
                    break;
                case 'invalidTopic':
                    Utils.notify('Не корректный топик<br>Возможно он был удален', 'warning');
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        });
    },

    read: function(type, id) {
        if (id === undefined)
            id = 'none';

        var btn = $('.read-link');
        btn.button('loading');
        requestHandler.ajaxRequest('/api/forum/read', {
            type: type,
            id: id
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    if (type == 'forum') {
                        $('h3.title > a > span').each(function(e){
                            $(this).css('font-weight', 'normal');
                        });
                        $('.unread-icon').remove();

                        $('#forum-' + id).find('div').first().removeClass('unread');
                        $('#forum-' + id).find('img.nodeIcon').first().css('cursor', 'default');
                    }
                    if (type == 'forum')
                        Utils.notify('Раздел отмечен прочитанным', 'warning');
                    else if (type == 'board')
                        Utils.notify('Разделы отмечены прочитанными', 'warning');
                    else
                        Utils.notify('Тема отмечена прочитанной', 'warning');
                    break;
                case 'invalidForum':
                    Utils.notify('Не корректный форум', 'warning');
                    break;
                case 'userNotActivated':
                    Utils.notify('Пользователь не активирован', 'warning');
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        });
    },

    unread: function(type, id) {
        if (id === undefined)
            id = 'none';

        var btn = $('.unread-link');
        btn.button('loading');
        requestHandler.ajaxRequest('/api/forum/unread', {
            type: type,
            id: id
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    if (type == 'forum')
                        Utils.notify('Раздел отмечен непрочитанным', 'warning');
                    else if (type == 'board')
                        Utils.notify('Разделы отмечены непрочитанными', 'warning');
                    else
                        Utils.notify('Тема отмечена непрочитанной', 'warning');
                    break;
                case 'invalidForum':
                    Utils.notify('Не корректный форум', 'warning');
                    break;
                case 'userNotActivated':
                    Utils.notify('Пользователь не активирован', 'warning');
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        });
    },

    upTopic: function(id) {
        var btn = $('.upTopicBtn');
        btn.button('loading');
        requestHandler.ajaxRequest('/api/forum/upTopic', {
            id: id
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    location.reload();
                    break;
                case 'invalidTopic':
                    Utils.notify('Некорректная тема', 'warning');
                    break;
                case 'topicThrottle':
                    Utils.notify('Вы недавно создали тему<br>Поднять её можно будет <span class="date-time-from" data-time="' + response.time + '"></span>')
                    app.checkTime('.date-time-from', true, true);
                    break;
                case 'closed':
                    Utils.notify('Нельзя поднимать закрытый топик', 'warning', 3000);
                    break;
                case 'throttle':
                    Utils.notify('Поднять тему можно будет <span class="date-time-from" data-time="' + response.time + '"></span>');
                    app.checkTime('.date-time-from', true, true);
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        });
    },

    /**
     * Sends message to the chat
     * @returns {*}
     */
    sendChatMessage: function() {
        var content = $('#chatMessageInput');

        if (content.val().trim().length === 0)
            return Utils.notify('Нельзя отправить пустое сообщение');

        //content.attr('disabled', true);
        requestHandler.ajaxRequest('/api/chat/sendMessage', {
            content: content.val()
        }, function(response) {
            //content.attr('disabled', false);
            switch (response.status){
                case 'success':
                    //Chat.appendToChat(response.data, true);
                    //checkTime();
                    Chat.getChatMessagesWrapper(false, true);
                    // Chat.getChatMessagesWrapper(false, Chat._scroll_at_end);
                    $('#chatMessageInput').val('');
                    break;
                case 'throttle':
                    Utils.notify('Нельзя отправлять сообщения так быстро');
                    break;
                case 'same':
                    Utils.notify('Текущее сообщение дублирует ваше предыдущее');
                    break;
                case 'contentLength':
                    Utils.notify('Слишком длинное сообщение');
                    break;
                case 'userNotActivated':
                    Utils.notify('Пользователь не активирован', 'warning');
                    break;
                case 'userSuspended':
                    break;
            }
        });
    },
    tooltipQuote: function(element, postid, userid, username) {
        // Mark
        //Utils.markSelection();

        $('#reply-tooltip').remove();

        var html = '';
        html += '<div id="reply-tooltip" class="tooltip flipped reverse" style="display: none">' +
            '<span class="arrow"></span>' +
            '<a data-post-id="' + postid + '" data-user-id="' + userid + '" data-username="' + username + '" href="post/' + postid + '">' +
            'Ответить' +
            '</a>' +
            '</div>';

        $('body').append(html);

        var tooltip = $('#reply-tooltip');
        tooltip.show();

        //tooltip.css('bottom', '25px');
        //tooltip.css('right', '-15px');
        tooltip.css('left', $(element).offset().left - 60);
        tooltip.css('top', $(element).offset().top + 30);
        Utils.cleanupMarkers();
    },

    insertQuote: function(quote, postid, userid, username, moveToBottom, scrollElement) {
        moveToBottom = moveToBottom || true;
        scrollElement = scrollElement || '.quick-reply';

        var html = '';
        if (userid === 'undefined' && postid === 'undefined') {
            html = '<p>[QUOTE]</p>' + quote.trim() + '<p>[/QUOTE]</p>';
        } else {
            html = '<p>[QUOTE="' + username + ', post: ' + postid + ', member: ' + userid + '"]</p>' + quote.trim() + '<p>[/QUOTE]</p>';
        }

        html += "<br>";
        app.insertRedactorContent(html);
        if (moveToBottom) {
            $('html, body').animate({
                scrollTop: $(scrollElement).offset().top
            }, 300);
        }
    },

    subscribeToUser: function(uid) {
        var btn = $('#subscribe-btn');

        btn.button('loading');
        requestHandler.ajaxRequest('/api/user/subscribe', {
            uid: uid
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    Profile.updateSubscriberData(true, uid);
                    break;
                case 'same':
                    Utils.notify('Нельзя подписаться на самого себя');
                    break;
                case 'already':
                    Utils.notify('Вы уже подписаны на данного пользователю', 'success', 4500);
                    break;
                case 'invalidUser':
                    Utils.notify('Некорректный пользователь', 'warning', 4500);
                    break;
                case 'userNotActivated':
                    Utils.notify('Пользователь не активирован', 'warning');
                    break;
                default:
                    console.warn('[Forum.subscribeToUser] Произошла неизвестная ошибка', JSON.stringify(response));
                    break;
            }
        });
    },

    unsubscribeFromUser: function(uid, remove) {
        var btn = $('#unsubscribe-btn');

        remove = remove === undefined ? false : true;

        btn.button('loading');
        requestHandler.ajaxRequest('/api/user/unsubscribe', {
            uid: uid,
            remove: remove,
        }, function(response) {
            btn.button('reset');
            switch (response.status){
                case 'success':
                    if (remove !== undefined) {
                        $('.member-list .member-list-item.user-' + uid).fadeOut();
                        Utils.notify('Пользователь был удален из подписчиков');
                    }

                    Profile.updateSubscriberData(false, uid);
                    break;
                case 'same':
                    Utils.notify('Нельзя подписаться на самого себя');
                    break;
                case 'invalidUser':
                    Utils.notify('Некорректный пользователь', 'warning', 4500);
                    break;
                case 'notSubscribed':
                    Utils.notify('Вы не подписаны на данного пользователя', 'warning', 4500);
                    break;
                case 'userNotActivated':
                    Utils.notify('Пользователь не активирован', 'warning');
                    break;
                default:
                    console.warn('[Forum.unsubscribeFromUser] Произошла неизвестная ошибка', JSON.stringify(response));
                    break;
            }
        });
    },

    logout: function() {
        requestHandler.ajaxRequest('/api/user/logout', {}, function(result) {
            switch (result.status) {
                case 'success':
                    location.href = '';
                    break;
            }
        });
    },

    getBBCode: function(id, quotes, type) {
        quotes = quotes === undefined;
        type = type === undefined ? 'post' : type;
        var data = '';

        requestHandler.ajaxRequest('/api/forum/getPostCode', {
            pid: id,
            quotes: quotes,
            type: type
        }, function(response) {
            switch (response.status){
                case 'success':
                    data = Base64.decode(response.data);
                    break;
                case 'invalidPost':
                    Utils.notify('Некорректный пост', 'warning', 6000);
                    break;
                default:
                    Utils.notify('Произошла неизвестная ошибка', 'danger');
                    break;
            }
        }, false);

        return data;
    },

    /**
     * Add wall post DOM element
     *
     * @param data JSON
     * @param reply Is reply?
     * @param type Type
     * @param force Force?
     */
    addWallPostDOM: function (data, reply, type, force) {
        reply = reply || null;
        type = type || 'prepend';
        force = force || false;

        if (reply && !force)
            type = 'append';

        var noPostsContainer = $('#no-wall-posts');
        var container = !reply ? $('.profile-wall') : $('#wall-post-' + reply);
        var streamContainer = $('.stream-container');
        var currentUid = Utils.user_id;
        var html = '';
        var block = '';
        var readOnly = $('.latest-wall-posts').length > 0;
        var hideControlBlock = false;

        var path = location.pathname.split("/").filter(String);
        if (path[1] !== undefined && path[1] === "deleted-profile")
            hideControlBlock = true;

        if (!reply) {
            if (noPostsContainer.is(':visible')) {
                noPostsContainer.hide();

                block = '';
                block += '<ul class="post-list list-inline">';
                block += '</ul>';

                streamContainer.append(block);
            }
        } else {
            if (container.find('.stream-form').length > 0) {
                container = container.find('.stream-form').first();
            }

            if (container.find('.wall-post-comments').length === 0) {
                block = '';

                block += '<div class="wall-post-comments clearfix">';
                block += '<ul id="comments-' + reply + '" class="list-inline">';
                block += '</ul>';
                block += '</div>';

                container.append(block);
            }
        }

        var avatar = data.user_avatar ? data.user_avatar : Utils.avatar_small;
        var userLink = data.user_link ? data.user_link : Utils.user_link;
        var userStatus = data.user_is_online !== undefined ? data.user_is_online : Utils.is_online;
        var nickColor = data.user_nick_color !== undefined ? 'color: ' + data.user_nick_color + ';' : 'color: ' + Utils.nick_color + ';';
        var userIsBanned = data.user_is_banned !== undefined ? data.user_is_banned : false;
        var userIsSiteTeam = data.user_is_site_team !== undefined ? data.user_is_site_team : false;

        if (!userLink) {
            console.warn('[addWallPostDOM] Ooops there is no userLink. Continuing anyway :( Data is: ' + JSON.stringify(data));
        }

        html += '<li id="wall-' + (!reply ? 'post' : 'comment') + '-' + data.id + '" class="' + (!reply ? 'stream-item primary-content' : 'wall-comment' ) + '" ' + (!reply ? '' : 'data-is-comment="true"') + ' data-post-id="' + data.id + '">';

        html += '<div class="clearfix">'
        html += '       <div class="stream-item-header">';
        html += '           <a href="members/' + userLink + '/' + '" class="user-photo user-photo-' + (!reply ? 'mini' : 'tiny' ) + '" title="Перейти в профиль пользователя ' + data.username_c + '">';
        html += '               <img src="' + avatar + '" alt="">';
        html += '               <span class="status-marker-round ' + (userStatus ? 'online' : '') + '"></span>';
        html += '           </a>';
        html += '       </div>';

        html += '       <div class="' + (!reply ? 'stream-snippet' : 'comment-content' ) + ' no-margin-top">';
        html += '           <div class="text-medium">';
        html += '               <a href="members/'+ userLink + '/" class="stream-username" style="' + nickColor + (userIsBanned ? 'text-decoration: line-through !important;' : '') + '">' + data.username_c + '</a>';
        html += '               <span class="stream-content">' + data.content + '</span>';
        html += '           </div>';
        html += '       </div>';

        html += '       <div class="stream-meta">';
        html += '           <div class="meta-info">';
        html += '               <ul class="list-inline muted">';
        html += '                   <li>';
        if (!reply) {
            html += '                   <a href="wall/' + data.id + '">';
        } else {
            html += '                   <a href="wall-comment/' + data.id + '">';
        }
        html += '                           <time data-time="' + data.date_unix + '">' + data.date_parsed + '</time>';
        html += '                   </a>';
        html += '                   </li>';

        if (data.user_id !== Utils.user_id && !readOnly) {
            html += '                   <li class="likes" data-likes="' + data.likes + '">';
            html += '                       <a class="' + (data.is_user_liked ? 'liked' : '') + '" href="javascript:togglePostLike(' + data.id + ', ' + (!reply ? 'false' : 'true') + ')">';
            html += '                           <i class="fa fa-heart"></i>';
            html += '                           <span id="likes-' + (!reply ? 'wall' : 'comment') + '-count-' + data.id + '">' + (data.likes_count > 0 ? data.likes_count : '') + '</span>';
            html += '                       </a>';
            html += '                   </li>';
        }

        html += '               </ul>';
        html += '           </div>';

        html += '           <div class="meta-controls">';
        html += '               <ul class="list-inline muted">';

        if (!reply && !readOnly) {
            html += '                   <li>';
            html += '                       <a href="javascript:replyWallPost(' + data.id + ')">';
            html += '                           <i class="fa fa-comment"></i>';
            html += '                           Ответить';
            html += '                       </a>';
            html += '                   </li>';
        }
        if ((Utils.isAdmin || Utils.isSuperModerator || Utils.isGlobalModerator) && !userIsBanned && !readOnly && data.abuses_count !== undefined && data.abuses_count > 0) {
                html += '                   <li>';
                html += '                       <a href="javascript:abusesList(' + data.id + ', \'' + (reply ? 'wallPostComment' : 'wallPost') + '\');" class="item control text-warning">';
                html += '                           Жалобы (' + data.abuses_count + ')';
                html += '                       </a>';
                html += '                   </li>';
        } else if (!Utils.isAdmin && !Utils.isSuperModerator && !Utils.isGlobalModerator && data.user_id !== Utils.user_id && !userIsBanned && !readOnly && !userIsSiteTeam && Utils.isLogged) {
            html += '                   <li>';
            html += '                       <a href="javascript:abusePost(' + data.id + ', \'' + (reply ? 'wallPostComment' : 'wallPost') + '\');" class="item control text-warning">';
            html += '                           <i class="fa fa-bullhorn"></i>';
            html += '                           Жалоба';
            html += '                       </a>';
            html += '                   </li>';
        }
        if ((Utils.isAdmin || Utils.isSuperModerator) && !userIsBanned && !readOnly && data.user_id !== Utils.user_id && !userIsSiteTeam && data.user_posts_count <= Utils.config.spamRestrictPosts) {
            html += '                   <li>';
            html += '                       <a id="spamMessage' + data.id + '" href="javascript:processSpamMessageModal(' + data.id + ', ' + data.user_id + ', \'' + (reply ? 'wall_post_comment' : 'wall_post') + '\');" class="item control text-danger">';
            html += '                           <i class="fa fa-fw fa-ban"></i>';
            html += '                           Спам';
            html += '                       </a>';
            html += '                   </li>';
        }
        if ((data.user_id === Utils.user_id || Utils.isAdmin || Utils.isSuperModerator || Utils.isGlobalModerator) && !userIsBanned && !readOnly && !hideControlBlock) {
            html += '               <li>';
            html += '                   <a href="javascript:editWallPost(' + data.id + '' + (reply ? ', true' : '') + ')">';
            html += '                       <i class="fa fa-edit"></i>';
            html += '                       <span class="edit-text">Редактировать</span>';
            html += '                   </a>';
            html += '               </li>';
            html += '               <li>';
            html += '                   <a href="javascript:' + (!reply ? 'removeWallPostModal' : 'removeWallCommentModal') + '(' + data.id + ')" class="text-danger">';
            html += '                       <i class="fa fa-trash-o"></i>';
            html += '                       <span class="remove-text">Удалить</span>';
            html += '                   </a>';
            html += '               </li>';
        }
        html += '               </ul>';
        html += '           </div>';

        html += '       </div>';

        html += '</div>';

        html += '</li>';

        if (!reply)
            container.find('.post-list').first().prepend(html);
        else {
            if (type === 'prepend')
                container.find('#comments-' + reply).first().prepend(html);

            if (type === 'append')
                container.find('#comments-' + reply).first().append(html);
        }

        app.checkTime();
    },

    /**
     * Toggle hide user GIF avatar
     * @param userId Integer
     */
    toggleHideUserGifAvatar: function(userId) {
        var btn = $('.toggle-avatar-' + userId);

        btn.button('loading');
        requestHandler.ajaxRequest('/api/user/toggleHideUserAvatar', {
            user_id: userId
        }, function(response) {
            btn.button('reset');
            switch (response.status) {
                case 'success':
                    $('.user-block-' + userId + ' a.avatar img:first-of-type').attr('src', response.avatar);
                    setTimeout(function(){
                        if (response.result === 'hidden') {
                            $('.toggle-avatar-' + userId).each(function(i, o) {
                                $(o).attr('title', 'Показать');
                            });
                            $('.toggle-avatar-' + userId).find('i.fa').each(function (i, o) {
                                $(o).removeClass('fa-close').addClass('fa-eye');
                            });
                        } else if (response.result === 'showed') {
                            $('.toggle-avatar-' + userId).each(function(i, o) {
                                $(o).attr('title', 'Скрыть');
                            });
                            $('.toggle-avatar-' + userId).find('i.fa').each(function (i, o) {
                                $(o).removeClass('fa-eye').addClass('fa-close');
                            });
                        }
                    }, 400);

                    break;
                case 'invalidUser':
                    Utils.notify('Некорректный пользователь', 'warning', 4500);
                    break;
            }
        });
    }

};

