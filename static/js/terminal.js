$(function () {
    $(document).keypress(function (e) {
        if (e.keyCode == 13) {
            var command = $('.terminal-input').val();
            Wiki.server.exec(command);
            $('.terminal-input').val('');
            $('.terminal').append('<br>'+command);
        }
    });

    socket.on('execed', function (data) {
        $('.terminal').append('<br>' + '<pre>' + data.out + '</pre>');
        $(window).scrollTop($(document).height())
    });
});


