
(function () {

    var lastPeerId = null;
    var peer = null; // own peer object
    var conn = null;
    var recvIdInput = document.getElementById("receiver-id");
    var status = document.getElementById("status");
    var message = document.getElementById("message");
    var sendMessageBox = document.getElementById("sendMessageBox");
    var sendButton = document.getElementById("sendButton");
    var connectButton = document.getElementById("connect-button");
    var cueString = "<span class=\"cueMsg\">Cue: </span>";

    /**
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
    function initialize() {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer('123id123', {
            debug: 2
        });

        peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (peer.id === null) {
                console.log('Received null id from peer open');
                peer.id = lastPeerId;
            } else {
                lastPeerId = peer.id;
            }
        });
        peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function() {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() { c.close(); }, 500);
            });
        });
        peer.on('disconnected', function () {
            status.innerHTML = "Connection lost. Please reconnect";

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });
        peer.on('close', function() {
            conn = null;
            status.innerHTML = "Connection destroyed. Please refresh";
        });
        peer.on('error', function (err) {
            alert('' + err);
        });
    };

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    function join() {
        // Close old connection
        if (conn) {
            conn.close();
        }

        // Create connection to destination peer specified in the input field
        conn = peer.connect(recvIdInput.value, {
            reliable: true
        });

        conn.on('open', function () {
            status.innerHTML = "Connected to: " + conn.peer;
        });
        // Handle incoming data (messages only since this is the signal sender)
        conn.on('data', function (data) {
            addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
        });
        conn.on('close', function () {
            status.innerHTML = "Connection closed";
        });
    };

    /**
     * Send a signal via the peer connection and add it to the log.
     * This will only occur if the connection is still alive.
     */
      function signal(sigName) {
        if (conn && conn.open) {
            conn.send(sigName);
            addMessage(cueString + sigName);
        } else {
            console.log('Connection is closed');
        }
    }

    function addMessage(msg) {
        message.innerHTML = "<br>" + msg + message.innerHTML;
    }

    // Send message
    sendButton.addEventListener('click', function () {
        if (conn && conn.open) {
            var msg = sendMessageBox.value;
            sendMessageBox.value = "";
            conn.send(msg);
            addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
        } else {
            console.log('Connection is closed');
        }
    });

    // Start peer connection on click
    connectButton.addEventListener('click', join);

    // Since all our callbacks are setup, start the process of obtaining an ID
    initialize();
})();
