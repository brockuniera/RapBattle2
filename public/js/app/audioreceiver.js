define(function (require) {
    var $ = require('jquery');

    //
    // Socket io
    //

    var io = require('socketio');

    // Create socket
    var url = 'http://localhost:8000';
    var socket = io.connect(url);

    socket.connect();

    var requestData = function(num, callback){
        // We're 0-indexed, but the files are 1-indexed
        socket.emit('request', {num: num + 1});
        savedCallback = callback;
    };

    // For every data thing we get, save it to a variable and fire an event.
    var savedCallback = null;
    socket.on('raw', function (data) {
        savedCallback(data);
    });

    // 
    // Our code
    //

    var audio = document.querySelector('audio');
    var mediaSource = new MediaSource();

    var segments = 3;

    mediaSource.addEventListener('sourceopen', function(){
        var sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        function onAudioLoaded(data, index){
            if (index === 0) {
                audio.play();
                sourceBuffer.addEventListener('updateend', function() {
                    if (++index < segments) {
                        requestData(index, function(data) {
                            console.log('Loading ' + index);
                            onAudioLoaded(data, index);
                        });
                    } else {
                        console.log('endOfStream()');
                        mediaSource.endOfStream();
                    }
                });
            }
            sourceBuffer.appendBuffer(data);
        }
        console.log('starting...');
        requestData(0, function(data){
            onAudioLoaded(data, 0);
        });
    }, false);

    audio.src = window.URL.createObjectURL(mediaSource);
});
