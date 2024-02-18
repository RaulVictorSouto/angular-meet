export const environment = {
  production: false,
  wsEndpoint: 'ws://localhost:8081/',
  RTCPeerConfiguration: {
    iceServers: [
      {
        urls: 'stun:stun.chathelp.ru:3478'
      }
    ]
  }
};
