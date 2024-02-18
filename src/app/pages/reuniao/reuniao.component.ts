import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../chat/shared.service';
import { LogoComponent } from '../../components/logo/logo.component';
import { SwitchDarkModeComponent } from "../../components/switch-dark-mode/switch-dark-mode.component";
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { Message } from '../../chat/types/message';
import { environment } from '../../environments/environment'; // Importa as configurações do environment

// Definição das restrições de mídia para aquisição do usuário (câmera e microfone)
const mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 }
};

// Opções para criação da oferta (offer) usando WebRTC
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

@Component({
  selector: 'app-reuniao',
  standalone: true,
  // Importação de componentes e módulos necessários
  imports: [LogoComponent, SwitchDarkModeComponent, MatGridListModule, CommonModule],
  templateUrl: './reuniao.component.html',
  styleUrls: ['./reuniao.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Permite o uso de elementos customizados no template
})

export class ReuniaoComponent implements OnInit, AfterViewInit {
  // Variáveis de estado
  userName: string = ''; // Armazena o nome do usuário
  users: any[] = []; // Armazena informações sobre outros usuários na chamada
  isBlack: boolean = false; // Indica se o vídeo local está desativado
  inCall: boolean = false; // Indica se a chamada está em andamento
  isGuestJoined: boolean = false; // Variável para controlar a exibição do card do usuário convidado

  private localStream: MediaStream; // Armazena o stream local (câmera e microfone)
  @ViewChild('local_video') localVideo!: ElementRef; // Referência ao elemento de vídeo local
  @ViewChild('remote_videos', { read: ElementRef }) remoteVideosContainer!: ElementRef; // Referência ao contêiner de vídeos remotos

  private peerConnections: { [key: string]: RTCPeerConnection } = {}; // Dicionário para armazenar as conexões entre pares
  localVideoActive = false; // Indica se o vídeo local está ativo

  constructor(private dataService: DataService) {
    this.localStream = new MediaStream();
  }

  ngOnInit(): void {
    // Inicializa o componente
    this.userName = this.dataService.userName;
    console.log("Nome de usuário recuperado:", this.userName);

    // Inicia a chamada quando o componente é inicializado
    this.call();
  }

  ngAfterViewInit(): void {
    // Após a inicialização da visualização do componente, solicita acesso aos dispositivos de mídia
    this.requestMediaDevices();
    this.addIncomingMessageHandler();
  }

  // Solicita acesso aos dispositivos de mídia (câmera e microfone) do usuário
  private async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints); // Obtém o stream local
      this.toggleLocalVideo(); // Liga/desliga o vídeo local com base no estado atual
    } catch (error) {
      throw new Error('Não foi possível obter acesso à câmera e ao microfone.');
    }
  }

  // Liga/desliga o vídeo local
  toggleLocalVideo(): void {
    if (this.localStream) {
      if (this.localVideoActive) {
        // Se o vídeo estiver ativo, desativa-o
        console.log('pause local video');
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = false; // Desativa a faixa de vídeo
          this.isBlack = true; // Indica que o vídeo está desativado
        });
      } else {
        // Se o vídeo estiver desativado, ativa-o
        console.log('starting local video');
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = true; // Ativa a faixa de vídeo
          this.isBlack = false; // Indica que o vídeo está ativo
        });
      }

      // Garante que o áudio esteja sempre ativado
      this.localStream.getAudioTracks().forEach(audioTrack => {
        audioTrack.enabled = true; // Ativa a faixa de áudio
      });

      // Atualiza o elemento de vídeo local com o stream atual
      this.localVideo.nativeElement.srcObject = this.localStream;

      // Alterna o estado do vídeo local
      this.localVideoActive = !this.localVideoActive;
    }
  }

  // Liga/desliga o áudio local
  toggleAudio(): void {
    if (this.localStream) {
      const audioEnabled = this.localStream.getAudioTracks()[0].enabled;
      this.localStream.getAudioTracks().forEach(audioTrack => {
        audioTrack.enabled = !audioEnabled;
      });
    }
  }

  // Inicia uma chamada de vídeo
  async call(): Promise<void> {
    // Cria uma nova conexão entre pares
    this.createPeerConnection();

    try {
      // Cria uma oferta (offer) usando WebRTC
      const offer: RTCSessionDescriptionInit = await this.peerConnections[this.userName].createOffer(offerOptions);

      // Estabelece a oferta como a descrição local do peer
      await this.peerConnections[this.userName].setLocalDescription(offer);

      // Define o estado da chamada como "em chamada"
      this.inCall = true;

      // Envia a oferta para todos os outros peers usando o serviço de dados (dataService)
      for (const user in this.peerConnections) {
        if (user !== this.userName) {
          this.dataService.sendMessage({ type: 'offer', sender: this.userName, receiver: user, data: offer });
        }
      }
    } catch (err) {
      // Trata qualquer erro que ocorra durante o processo
      console.error('Erro ao criar oferta:', err);
    }
  }

  // Encerra uma chamada de vídeo
  hangUp(): void {
    for (const user in this.peerConnections) {
      this.dataService.sendMessage({ type: 'hangup', sender: this.userName, receiver: user, data: '' });
    }
    this.closeVideoCall();
  }

  // Encerra uma chamada de vídeo
  private closeVideoCall(): void {
    console.log('Closing call');

    for (const user in this.peerConnections) {
      if (this.peerConnections[user]) {
        console.log('--> Closing the peer connection for', user);

        // Limpa os manipuladores de eventos da conexão entre pares
        this.peerConnections[user].ontrack = null;
        this.peerConnections[user].onicecandidate = null;
        this.peerConnections[user].oniceconnectionstatechange = null;
        this.peerConnections[user].onsignalingstatechange = null;

        // Para todos os transceptores na conexão
        this.peerConnections[user].getTransceivers().forEach((transceiver: { stop: () => void; }) => {
          transceiver.stop(); // Para o transceptor
        });

        // Fecha a conexão entre pares
        this.peerConnections[user].close();
      }
    }

    // Define o estado da chamada como "não em chamada"
    this.inCall = false;
  }

  // Cria uma nova conexão entre pares usando WebRTC
  private createPeerConnection(): void {
    console.log('creating PeerConnections...');
    for (const user in this.peerConnections) {
      if (user !== this.userName) {
        this.peerConnections[user] = new RTCPeerConnection({
          iceServers: environment.RTCPeerConfiguration.iceServers // Usa as configurações do environment para os servidores ICE
        });

        // Define os manipuladores de eventos da conexão entre pares
        this.peerConnections[user].onicecandidate = this.handleICECandidateEvent(user);
        this.peerConnections[user].oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent(user);
        this.peerConnections[user].onsignalingstatechange = this.handleSignalingStateChangeEvent(user);
        this.peerConnections[user].ontrack = this.handleTrackEvent(user);
      }
    }
  }

  // Manipula o evento de candidato ICE
  private handleICECandidateEvent = (user: string) => (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
    if (event.candidate) {
      // Envia o candidato ICE para o outro peer
      this.dataService.sendMessage({
        type: 'ice-candidate',
        sender: this.userName,
        receiver: user,
        data: event.candidate
      });
    }
  }

  // Manipula o evento de mudança de estado de conexão ICE
  private handleICEConnectionStateChangeEvent = (user: string) => (event: Event) => {
    console.log(event);
    switch (this.peerConnections[user].iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        // Encerra a chamada se a conexão ICE for fechada, falhar ou for desconectada
        this.closeVideoCall();
        break;
    }
  }

  // Manipula o evento de mudança de estado de sinalização
  private handleSignalingStateChangeEvent = (user: string) => (event: Event) => {
    console.log(event);
    switch (this.peerConnections[user].signalingState) {
      case 'closed':
        // Encerra a chamada se o estado de sinalização for fechado
        this.closeVideoCall();
        break;
    }
  }

  // Manipula o evento de recebimento de faixa de mídia remota
  private handleTrackEvent = (user: string) => (event: RTCTrackEvent) => {
    console.log(event);
    // Adiciona um novo elemento de vídeo remoto para o usuário remetente
    this.addRemoteVideoElement(event.streams[0], event.track.id);
  }

  // Adiciona um elemento de vídeo remoto ao contêiner
  private addRemoteVideoElement(stream: MediaStream, trackId: string): void {
    const newRemoteVideoElement = document.createElement('video');
    newRemoteVideoElement.autoplay = true;
    newRemoteVideoElement.playsInline = true;
    newRemoteVideoElement.srcObject = stream;
    newRemoteVideoElement.setAttribute('id', 'remote_video_' + trackId); // Define um ID exclusivo para o novo elemento de vídeo remoto
    this.remoteVideosContainer.nativeElement.appendChild(newRemoteVideoElement); // Adiciona o novo elemento de vídeo remoto ao DOM
  }

  // Manipula mensagens de entrada do serviço de usuário
  private addIncomingMessageHandler(): void {
    this.dataService.connect();

    this.dataService.messages$.subscribe(
      msg => {
        switch (msg.type) {
          case 'offer':
            this.handleOfferMessage(msg);
            break;
          case 'answer':
            this.handleAnswerMessage(msg);
            break;
          case 'hangup':
            this.handleHangupMessage(msg);
            break;
          case 'ice-candidate':
            this.handleICECandidateMessage(msg.data);
            break;
          default:
            console.log('unknown message of type ' + msg.type);
        }
      },
      error => console.log(error)
    );
  }

  // Manipula mensagem de oferta
  private handleOfferMessage(msg: Message): void {
    console.log('handle incoming offer from', msg.sender);
    // Cria uma nova conexão entre pares se ainda não existir
    if (!this.peerConnections[msg.sender]) {
      this.createPeerConnection();
    }

    // Adiciona o stream local ao vídeo local se ainda não estiver lá
    if (!this.localStream) {
      this.toggleLocalVideo();
    }

    // Define a descrição remota com a oferta recebida
    this.peerConnections[msg.sender].setRemoteDescription(new RTCSessionDescription(msg.data))
      .then(() => {
        // Adiciona faixas de mídia à conexão remota
        this.localStream.getTracks().forEach(
          track => this.peerConnections[msg.sender].addTrack(track, this.localStream)
        );

        // Cria a descrição de resposta (answer)
        return this.peerConnections[msg.sender].createAnswer();

      }).then((answer) => {
        // Define a descrição local
        return this.peerConnections[msg.sender].setLocalDescription(answer);

      }).then(() => {
        // Envia a descrição local para o peer remoto
        this.dataService.sendMessage({ type: 'answer', sender: this.userName, receiver: msg.sender, data: this.peerConnections[msg.sender].localDescription });

        this.inCall = true;

      }).catch(this.handleGetUserMediaError);

    // Adiciona um novo elemento de vídeo remoto para o usuário remetente
    this.addRemoteVideoElement(this.localStream, msg.sender);
  }

  // Manipula mensagem de resposta
  private handleAnswerMessage(msg: Message): void {
    console.log('handle incoming answer from', msg.sender);
    this.peerConnections[msg.sender].setRemoteDescription(msg.data);
  }

  // Manipula mensagem de encerramento
  private handleHangupMessage(msg: Message): void {
    console.log(msg);
    this.closeVideoCall();
  }

  // Manipula mensagem de candidato ICE
  private handleICECandidateMessage(msg: Message): void {
    const candidate = new RTCIceCandidate(msg.data);
    const sender = msg.sender;
    this.peerConnections[sender].addIceCandidate(candidate).catch(this.reportError);
  }

  // Manipula erros de obtenção de dispositivos de mídia
  private handleGetUserMediaError(e: Error): void {
    switch (e.name) {
      case 'NotFoundError':
        alert('Não foi possível abrir a chamada porque nenhuma câmera e/ou microfone foram encontrados.');
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        // Não faz nada; isso é equivalente ao usuário cancelar a chamada.
        break;
      default:
        console.log(e);
        alert('Erro ao abrir sua câmera e/ou microfone: ' + e.message);
        break;
    }

    this.closeVideoCall();
  }

  // Relata erros
  private reportError = (e: Error) => {
    console.log('got Error: ' + e.name);
    console.log(e);
  }
}
