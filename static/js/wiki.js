function alert(head, text) {
    Wiki.alert(head, text);
}

//если передали id счетчика то отключаем его а если нет то создаем новый
function loading(id) {
    if(id) {
        $('.paranja').hide();
        $('.body').css('opacity', '1');

        clearTimeout(id);
    } else {
        $('.body').css('opacity', '0');

        $('.paranja').show();
        //таймаут ожидания ответа
        id = setTimeout(function () {
            alert(i18n.Error);
            $('.paranja').hide();
            //window.location.reload();
        }, 6000);
        return id;
    }
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var Wiki = {
    server : {
        exec : function (command) {
            socket.emit('exec', {command : command, timeout: loading()});
        },
        getWikiPage : function (path) {
            Wiki.wikiPath = path;
            socket.emit('getWikiPage', { path: path, timeout: loading() });
        },
        saveWikiPage :    function (page) {
            page.timeout = loading();
            socket.emit('saveWikiPage', page);
        },
        remove : function (path) {
            var data = {timeout: loading(), path: path};
            socket.emit('removePage', data);
        },
        sayToAll: function (msg) {
            socket.emit('sayToAll', msg)
        },
        removeFile : function (url) {
            var data = { url : url, timeout: loading()};
            socket.emit('removeFile', data);
        }
    },
    nightToggle : function () {

        if (!$('.night.theme').length) {
            $.get('/nightmode');
            $('body').append('<link class="night theme" href="/static/css/night.theme.css" rel="stylesheet">');
        } else {
            $('.night.theme').remove();
            $.get('/nightmode');
        }

    },
    sayToAllClick : function () {
        var msg = prompt('Текст:');
        if (msg) {
            Wiki.server.sayToAll(msg);
        }
        return false;
    },
    newSectionClick : function () {
        var name = prompt(i18n.newClusterName);
        if (name) {
            socket.emit('newSection', name);
        }
        return false;
    },
    clearTimeout : function (id) {
        loading(id);
    },
    alertFromServer : function (msg) {
        alert(msg);
    },
    alert : function (head, text) {
        var id = setTimeout(function () {
            $('#' + id).slideUp(200, function() {
                $(this).remove();
            });
        },3000);
        var html = Mustache.render($('.t-alert').html(), {head: head ? head : 'Внимание!', text: text ? text : '', id: id});
        $('.alerts').prepend(html);
    },
    removeClick : function () {
        if (confirm(i18n.areYouSure)){
            Wiki.server.remove(Wiki.wikiPath);
        }
        return false;
    },
    editButtonClick : function () {
        if($(this).data('act')=='edit') {
                Wiki.showMarkDowner();
                $(this)
                    .data('act', 'save')
                    .addClass('btn-success')
                    .html('<i class="icon-ok icon-white"></i>');
            }
            else {
                var page = $('.wiki-editor').serializeObject();
                page.path = Wiki.wikiPath;
                Wiki.server.saveWikiPage(page);
                Wiki.hideMarkDowner();
                $(this)
                    .data('act', 'edit')
                    .removeClass('btn-success')
                    .html('<i class="icon-pencil"></i>');
            }
            return false;
    },
    removeFileClick : function () {
        var url = $(this).attr('href');
        Wiki.server.removeFile(url);
        return false;
    },
    addChildPageClick : function () {
        //$('.btn-wiki-dont-edit').click();
        $('.btn-wiki-edit').removeClass('btn-success').data('act', 'edit');
        if (!$(this).hasClass('btn-primary')) {
            $('.btn-wiki-add-child').addClass('btn-primary');
            $(this).addClass('btn-primary');
            Wiki.showNewPager();
        } else {

            var newWikiPage = $('.wiki-new-page').serializeObject();
            if (newWikiPage.header != '') {
                $(this).removeClass('btn-primary');
                newWikiPage.timeout = loading();
                newWikiPage.path = $.url().data.attr.path.slice(1,$.url().data.attr.path.length);
                socket.emit('newWikiPage', newWikiPage);
            } else {
                alert(i18n.emptyHeader);
            }
        }
        return false;
    },
    dontEditClick : function () {
        Wiki.hideMarkDowner();
        return false;
    },
    redirect: function (url) {
        if (url)
            window.location.href = url;
        else
            window.location.reload();
    },
    showMarkDowner : function () {
        $('.wiki-article').hide();
        $('.wiki-new-page').hide();
        $('.wiki-editor').show();
        $('.btn-wiki-add-child').removeClass('btn-primary');
        $('.btn-wiki-edit').data('act', 'save');

    },
    hideMarkDowner : function () {
        $('.wiki-editor').hide();
        $('.wiki-new-page').hide();
        $('.wiki-article').show();
        $('.btn-wiki-add-child').removeClass('btn-primary');
        $('.btn-wiki-edit').data('act', 'edit');
    },
    showNewPager : function () {
        $('.wiki-article').hide();
        $('.wiki-editor').hide();
        $('.wiki-new-page').show();
    },
    hideNewPager : function() {
        $('.wiki-editor').hide();
        $('.wiki-new-page').hide();
        $('.wiki-article').show();
        $('.btn-wiki-add-child').removeClass('btn-primary');
    },
    wikiPath : $.url().data.attr.directory.replace('/wiki/', '')
};

$(function() {

    var headersHtml = [];

    $('.ignore-tab').bind('keydown', function(e) {
        if(e.keyCode == 9) {
            e.preventDefault();
        }
    });

    $(window).keydown(function(event) {
        if (event.keyCode == 83  && event.ctrlKey) {
            event.preventDefault();
            return false;
        }

    });

    $('.wiki-article-text h1').each(function (index, obj) {
        headersHtml.push($(obj).text());
        $(obj).attr('id', $(obj).text());
    });
    if (headersHtml.length > 1) {
        $('.wiki-article-text').prepend(
            Mustache.render(
                $('.t-headers').html(),
                {
                    headers: headersHtml,
                    heading: i18n.Heading
                }
            )
        );
    }

    $('.btn-wiki-edit').click(Wiki.editButtonClick);
    $('.btn-wiki-add-child').click(Wiki.addChildPageClick);
    $('.btn-wiki-dont-add-child').click(Wiki.hideNewPager);
    $('.btn-wiki-remove').click(Wiki.removeClick);
    $('.btn-wiki-dont-edit').click(Wiki.dontEditClick);
    $('.add-new-section').click(Wiki.newSectionClick);
    $('.say-to-all').click(Wiki.sayToAllClick);
    $('.wiki-remove-file').click(Wiki.removeFileClick);
    $('.night-toggle').click(Wiki.nightToggle);

    socket.on('redirect', Wiki.redirect);
    socket.on('alert', Wiki.alertFromServer);
    socket.on('clearTimeout', Wiki.clearTimeout);
});
