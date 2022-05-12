(function () {

  var lastPeerId = null;
  var peer = null; // Own peer object
  var peerId = null;
  var conn = null;
  var recvId = document.getElementById("receiver-id");
  var status = document.getElementById("status");
  var message = document.getElementById("message");
  var sendMessageBox = document.getElementById("sendMessageBox");
  var sendButton = document.getElementById("sendButton");

  /**
   * Create the Peer object for our end of the connection.
   */
  function initialize() {
      // Create own peer object with connection to shared PeerJS server
      peer = new Peer('124id124', {
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

          recvId.innerHTML = "ID: " + peer.id;
          status.innerHTML = "Awaiting connection...";
      });
      peer.on('connection', function (c) {
          // Allow only a single connection
          if (conn && conn.open) {
              c.on('open', function() {
                  c.send("Already connected to another client");
                  setTimeout(function() { c.close(); }, 500);
              });
              return;
          }

          conn = c;
          status.innerHTML = "Connected";
          ready();
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
   * Triggered once a connection has been achieved.
   * Defines callbacks to handle incoming data and connection events.
   */
  function ready() {
      conn.on('data', function (data) {
          var cueString = "<span class=\"cueMsg\">Cue: </span>";
          
          addMessage("<span class=\"peerMsg\">Peer: </span>" + data);
                  
          
      });
      conn.on('close', function () {
          status.innerHTML = "Connection reset<br>Awaiting connection...";
          conn = null;
      });
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
          addMessage("<span class=\"selfMsg\">Self: </span>" + msg);
      } else {
          console.log('Connection is closed');
      }
  });


  initialize();
})();