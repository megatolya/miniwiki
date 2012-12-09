function alert(head, text) {
    Wiki.interface.alert(head, text);
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
            alert('Ошибка! :-(');
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
}

var Wiki = {
    server : {
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
    interface : {
        sayToAllClick : function () {
            var msg = prompt('Текст:');
            if (msg) {
                Wiki.server.sayToAll(msg);
            }
            return false;
        },
        newSectionClick : function () {
            var name = prompt('Название нового раздела');
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
            if (confirm('Вы уверены?')){
                Wiki.server.remove(Wiki.wikiPath);
            }
            return false;
        },
        editButtonClick : function () {
            if($(this).data('act')=='edit') {
                        Wiki.interface.showMarkDowner();
                        $(this)
                            .data('act', 'save')
                            .addClass('btn-success')
                            .html('<i class="icon-ok icon-white"></i> Сохранить');
                }
                else {
                    var page = $('.wiki-editor').serializeObject();
                    page.path = Wiki.wikiPath;
                    Wiki.server.saveWikiPage(page);
                    Wiki.interface.hideMarkDowner();
                        $(this)
                            .data('act', 'edit')
                            .removeClass('btn-success')
                            .html('<i class="icon-pencil"></i> Редактировать');
                }
                return false;
        },
        removeFileClick : function () {
            var url = $(this).attr('href');
            Wiki.server.removeFile(url);
            return false;
        },
        addChildPageClick : function () {
            var $edit = $('.btn-wiki-edit');
            if ($edit.data('act') == 'save') {
                $edit.click();
            }
            if (!$(this).hasClass('btn-primary')) {
                $('.btn-wiki-add-child').addClass('btn-primary');
                $(this).addClass('btn-primary');
                Wiki.interface.showNewPager();
            } else {

                var newWikiPage = $('.wiki-new-page').serializeObject();
                if (newWikiPage.header != '') {
                    $(this).removeClass('btn-primary');
                    newWikiPage.timeout = loading();
                    newWikiPage.path = $.url().data.attr.path.slice(1,$.url().data.attr.path.length);
                    socket.emit('newWikiPage', newWikiPage);
                } else {
                    alert('Пустой заголовок');
                }
            }
            return false;
        },
        dontEditClick : function () {
            Wiki.interface.hideMarkDowner();
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

        },
        hideMarkDowner : function () {
            $('.wiki-editor').hide();
            $('.wiki-new-page').hide();
            $('.wiki-article').show();
            $('.btn-wiki-add-child').removeClass('btn-primary');
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
        }
    },
    wikiPath : $.url().data.attr.directory.replace('/wiki/', '')
};

$(function() {
    $('.btn-wiki-edit').click(           Wiki.interface.editButtonClick);
    $('.btn-wiki-add-child').click(      Wiki.interface.addChildPageClick);
    $('.btn-wiki-dont-add-child').click( Wiki.interface.hideNewPager);
    $('.btn-wiki-remove').click(         Wiki.interface.removeClick);
    $('.btn-wiki-dont-edit').click(      Wiki.interface.dontEditClick);
    $('.add-new-section').click(         Wiki.interface.newSectionClick);
    $('.say-to-all').click(              Wiki.interface.sayToAllClick);
    $('.wiki-remove-file').click(        Wiki.interface.removeFileClick);

    socket.on('redirect',     Wiki.interface.redirect);
    socket.on('alert',        Wiki.interface.alertFromServer);
    socket.on('clearTimeout', Wiki.interface.clearTimeout);
});