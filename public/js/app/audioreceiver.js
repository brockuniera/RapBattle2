define(function (require) {
    var $ = require('jquery');


    // Cache XHRs to avoid repeated requests.
    var xhrCache = {};

    // Simple XHR based file loader.  Requests |url| as an ArrayBuffer and delivers
    // it to |callback| once the request completes successfully.
    function GET(url, callback) {
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
    }

    // 
    // Our code
    //

    var audio = document.querySelector('audio');
    var mediaSource = new MediaSource();

    var segments = 2;
    var names = ['songs/a.mp3', 'songs/b.mp3'];

    mediaSource.addEventListener('sourceopen', function(){
        // Do this on open
        var sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

        function onAudioLoaded(data, index){
            console.log(index);

            // When appendBuffer() completes it will fire an "updateend" event signaling
            // that it's okay to append another segment of media. Here we'll chain the
            // append for the next segment to the completion of our current append.
            if (index === 0) {
                sourceBuffer.addEventListener('updateend', function() {
                    if (++index < segments) {
                        GET(names[index], function(data) {
                            console.log('Loading ' + name[index]);
                            onAudioLoaded(data, index);
                        });
                    } else {
                        // We've loaded all available segments, so tell MediaSource there are
                        // no more buffers which will be appended.
                        mediaSource.endOfStream();
                    }
                });
            }

            // appendBuffer() will now use the timestamp offset and append window
            // settings to filter and timestamp the data we're appending.
            sourceBuffer.appendBuffer(data);
        }

        // Finally, grab our data
        GET(names[0], function(data){
            onAudioLoaded(data, 0);
        });
    }, false);

    audio.src = window.URL.createObjectURL(mediaSource);

});
