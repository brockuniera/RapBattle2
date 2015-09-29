define(function (require) {
    var $ = require('jquery');

    //
    // Socket io
    //

    var io = require('socketio');

    // Create socket
    var url = 'http://localhost:8000';
    var socket = io.connect(url);

    socket.on('connect', function(){
        console.log('Socket.io socket connected.');
    });

    socket.connect();

    var requestData = function(num, callback){
        socket.emit('request', {num: num + 1});
        savedCallback = callback;
    };

    // For every data thing we get, save it to a variable and fire an event.
    var savedCallback = null;
    socket.on('raw', function (data) {
        savedCallback(data);
    });

    //
    // XHR Get
    //

    // Cache XHRs to avoid repeated requests.
    var xhrCache = {};

    // Simple XHR based file loader.  Requests |url| as an ArrayBuffer and delivers
    // it to |callback| once the request completes successfully.
    var XHR_GET = function(url, callback) {
        if (url in xhrCache) {
            if (xhrCache[url] === 'pending') {
                setTimeout(function() {
                    GET(url, callback);
                }, 10);
            } else {
                setTimeout(function() {
                    callback(xhrCache[url]);
                }, 0);
            }
            return;
        }
        xhrCache[url] = 'pending';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (xhr.status === 200) {
                xhrCache[url] = xhr.response;
                callback(xhr.response);
            } else {
                console.log('GET ' + url + ' failed: ' + xhr.status);
            }
        };
        xhr.send();
    };

    //var GET = SOCKETIO_GET;
    var GET = XHR_GET;

    // 
    // Our code
    //

    var audio = document.querySelector('audio');
    var mediaSource = new MediaSource();

    var segments = 6;
    var names = ['songs/a.mp3', 'songs/b.mp3'];

    mediaSource.addEventListener('sourceopen', function(){
        // Do this on open
        console.log('addSourceBuffer()')
        var sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

        // Callback subject of GET
        function onAudioLoaded(data, index){
            // When appendBuffer() completes it will fire an "updateend" event signaling
            // that it's okay to append another segment of media. Here we'll chain the
            // append for the next segment to the completion of our current append.
            if (index === 0) {
                // Auto start audio
                audio.play();

                sourceBuffer.addEventListener('updateend', function() {
                    if (++index < segments) {
                        requestData(index, function(data) {
                            console.log('Loading ' + index);
                            onAudioLoaded(data, index);
                        });
                    } else {
                        // We've loaded all available segments, so tell MediaSource there are
                        // no more buffers which will be appended.
                        console.log('endOfStream()');
                        mediaSource.endOfStream();
                    }
                });
            }

            // appendBuffer() will now use the timestamp offset and append window
            // settings to filter and timestamp the data we're appending.
            sourceBuffer.appendBuffer(data);
        }

        // Finally, grab our data
        console.log('starting...');
        requestData(0, function(data){
            onAudioLoaded(data, 0);
        });
    }, false);

    audio.src = window.URL.createObjectURL(mediaSource);

});
