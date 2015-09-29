//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: "js/lib",
    paths: {
      app: "../app",
      jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min",
      socketio: "//cdn.socket.io/socket.io-1.3.5"
    }
});
