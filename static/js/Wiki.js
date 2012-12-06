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
        alert('ПИЗДЕЦ!!!!!!!!');
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
    getWikiPage : function (id) {
      wikiId = id;
      History.pushState(null, null, '/wiki/' + id);
      socket.emit('getWikiPage', { id: id, timeout: loading() });
    },
    saveWikiPage :  function (page) {
      page.timeout = loading();
      socket.emit('saveWikiPage', page);
    },
    remove : function (id) {
      var data = {};
      data.id = id;

      data.timeout = loading();
      socket.emit('removePage', data);
    }
  },
  interface : {
    alert : function (head, text) {
      var id = setTimeout(function () {
        $('#' + id).slideUp(200, function() {
          $(this).remove();
        });
      },3000);
      var html = Mustache.render($('.t-alert').html(), {head: head ? head : 'Внимание!', text: text ? text : '', id: id});
      $('.alerts').prepend(html);
    },
    wikiLinkClick : function () {
      History.pushState(null, null, $(this).attr('href'));
      var id = +$(this).attr('href').replace('/wiki/' , '');
      Wiki.server.getWikiPage(id);
      return false;
    },
    removeClick : function () {
      Wiki.server.remove(wikiId);
      return false;
    },
    pageRemoved : function (data) {
      console.log(data);
      loading(data.timeout);
      //TODO if parent == 0
      alert('страница удалена');
      Wiki.server.getWikiPage(data.parent);
    },
    editButtonClick : function () {
      if($(this).data('act')=='edit') {
            Wiki.interface.showMarkDowner();
            $(this).data('act', 'save').addClass('btn-success').html('<i class="icon-ok icon-white"></i> Сохранить');
        }
        else {
          var page = $('.wiki-editor').serializeObject();
          page.id = wikiId;
          Wiki.server.saveWikiPage(page);
          Wiki.interface.hideMarkDowner();
            $(this).data('act', 'edit').removeClass('btn-success').html('<i class="icon-pencil"></i> Редактировать');
        }
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
    newPassClick : function () {
      var data = {};
      data.oldPass = prompt('Старый пароль');
      data.newPass = prompt('Новый пароль');
      data.timeout = loading();
      $.ajax({
        url: '/change-pass/',
        type: 'POST',
        data : data,
        success : function(resp) {
          loading(data.timeout);
          if (resp.status == 'ok') {
            alert('Пароль изменен');
          } else {
            alert('Неверный старый пароль');
          }
        },
        error : function() {
          alert('Неизвестная ошибка');
        }
      });
      return false;
    },
    buildWikiPage : function (data) {
      //TODO reverse in backend
      loading(data.timeout);
      data.breadCrumbs.reverse();
      var mdHtml = Wiki.md.generateHtml(data.text);
      var html = Mustache.render($('.t-wiki').html(), data);


      $('.body').html(html);
      $('.wiki-article-text').html(mdHtml);
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
    },
    newPageSaved : function (data) {
      alert('Создана новая страница #' + data.id);
      loading(data.timeout);
      Wiki.server.getWikiPage(data.id);
    },
    PageSaved : function (data) {
      console.log(data);
      loading(data.timeout);
      alert('Сохранено');
      Wiki.server.getWikiPage(data.id);
    }
  },
  md : {
    generateHtml : function(md) {

      var regs = {
            h1 : /^#/i,
            h2 : /^##/i,
            h3 : /^###/i,
            h4 : /^####/i,
            h5 : /^#####/i,
          },
          html = '';

      var globalRegs = {
          code : /`{3}(?:(.*$)\n)?([\s\S]*)`{3}/m,
          link : /(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?((?:\([^)]*\)|[^()\s])*?)>?([ \t]*)((['"])(.*?)\6[ \t]*)?\))/g
      };

      while (globalRegs.code.test(md)) {
        md = md.replace(globalRegs.code, function(str, lang, code, lol) {
          return '<pre>' + code + '</pre>';
        });
      };

      while (globalRegs.link.test(md)) {
        md = md.replace(globalRegs.link, '<a href="$4">$2</a>');
      };

      var strs = md.split('\n');
      $(strs).each(function (index, str) {
        str = $.trim(str);

        if (regs.h5.test(str)) {
          str = '<h5>' + str.replace(regs.h5, '') + '</h5>';
        } else
        if (regs.h4.test(str)) {
          str = '<h4>' + str.replace(regs.h4, '') + '</h4>';
        } else
        if (regs.h3.test(str)) {
          str = '<h3>' + str.replace(regs.h3, '') + '</h3>';
        } else
        if (regs.h2.test(str)) {
          str = '<h2>' + str.replace(regs.h2, '') + '</h2>';
        } else
        if (regs.h1.test(str)) {
          str = '<h1>' + str.replace(regs.h1, '') + '</h1>';
        } else {
          str = '<p>' + str + '</p>';
        }
        html += str;
      });


      return html;
    }
  }
}
var isWikiRequest = /\/wiki\/[0-9]*/i,
   path = $.url().data.attr.directory,
   wikiId = +path.replace('/wiki/', '');

$(function() {

    if(isWikiRequest.test(path)) {
      Wiki.server.getWikiPage(+path.replace('/wiki/', ''));
    }
    var History = window.History; // Note: We are using a capital H instead of a lower h
/*    if ( !History.enabled ) {
         // History.js is disabled for this browser.
         // This is because we can optionally choose to support HTML4 browsers or not.
        return false;
    }*/

    // Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
        History.log(State.data, State.title, State.url);
    });


  $('.wiki-link').live('click', Wiki.interface.wikiLinkClick);
  $('.btn-wiki-edit').live('click', Wiki.interface.editButtonClick);
  $('.btn-wiki-add-child').live('click', Wiki.interface.addChildPageClick);
  $('.btn-wiki-dont-add-child').live('click', Wiki.interface.hideNewPager);
  $('.btn-wiki-remove').live('click', Wiki.interface.removeClick);
  $('.btn-new-pass').click(Wiki.interface.newPassClick);
  $('.btn-wiki-dont-edit').live('click', Wiki.interface.dontEditClick);

  socket.on('newWikiPageSave', Wiki.interface.newPageSaved);
  socket.on('buildWikiPage', Wiki.interface.buildWikiPage);
  socket.on('wikiPageSaved', Wiki.interface.PageSaved);
  socket.on('pageRemoved', Wiki.interface.pageRemoved);
});