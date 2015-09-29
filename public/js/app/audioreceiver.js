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

    // Nice code

    var audio = document.querySelector('audio');
    var mediaSource = new MediaSource();

    mediaSource.addEventListener('sourceopen', function(){
        var sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

        function onAudioLoaded(data, index){
            sourceBuffer.appendBuffer(data);
        }

        GET('songs/songmuted20.mp3', function(data) { onAudioLoaded(data, 0)});
    }, false);

    audio.src = window.URL.createObjectURL(mediaSource);
});
