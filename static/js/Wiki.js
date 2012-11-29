function alert(head, text) {
  Wiki.interface.alert(head, text);
}
var Wiki = {
  server : {
    getWikiPage : function () {
      socket.emit('getWikiPage', { id: +$(this).attr('href').replace('/wiki/' , '') });
      return false;
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
    editButtonClick : function () {
      if($(this).data('act')=='edit') {
            Wiki.interface.showMarkDowner();
            $(this).data('act', 'save').addClass('btn-success').text('Сохранить');
        }
        else {
          Wiki.interface.hideMarkDowner();
            $(this).data('act', 'edit').removeClass('btn-success').text('Редактировать');
        }
    },
    showMarkDowner : function () {
      $('.wiki-text').hide();
      $('.wiki-editor').show();
    },
    hideMarkDowner : function () {
      $('.wiki-text').show();
      $('.wiki-editor').hide();
    }
  },
  md : {
    generateHtml : function(md) {
      var strs = md.split('\n'),
          regs = {
            h1 : /^#/i,
            h2 : /^##/i,
            h3 : /^###/i,
            h4 : /^####/i,
            h5 : /^#####/i
          },
          html = '';


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
$(function() {


  $('.wiki-link').live('click', Wiki.server.getWikiPage);
  $('.btn-wiki-edit').on('click', Wiki.interface.editButtonClick);
  socket.on('buildWikiPage', function (data) {
    console.log('ответ');
    $('.body').html( Mustache.render($('.t-wiki').html(), data));
  });
});