$(function () {
    socket.on('log', function (msg) {
        $('.logger').prepend(msg + '<br>');
    });
})