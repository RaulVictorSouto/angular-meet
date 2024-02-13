import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../chat/shared.service';
import { LogoComponent } from '../../components/logo/logo.component';
import { SwitchDarkModeComponent } from "../../components/switch-dark-mode/switch-dark-mode.component";
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';

const mediaConstraints = {
  audio: true,
  video: { width: 1280, height: 720 }
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

@Component({
  selector: 'app-reuniao',
  standalone: true,
  imports: [LogoComponent, SwitchDarkModeComponent, MatGridListModule, CommonModule],
  templateUrl: './reuniao.component.html',
  styleUrls: ['./reuniao.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ReuniaoComponent implements OnInit, AfterViewInit {
  userName: string = '';
  users: any[] = [];
  isBlack: boolean = false;

  private localStream: MediaStream | null = null;
  @ViewChild('local_video') localVideo!: ElementRef;

  localVideoActive = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userName = this.userService.userName;
    console.log("Nome de usuário recuperado:", this.userName);
  }

  ngAfterViewInit(): void {
    this.requestMediaDevices();
  }

  private async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      this.toggleLocalVideo();
    } catch (error) {
      throw new Error('Não foi possível obter acesso à câmera e ao microfone.');
    }
  }

  toggleLocalVideo(): void {
    if (this.localStream) {
      if (this.localVideoActive) {
        console.log('pause local video');
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
          this.isBlack = true;
        });
      } else {
        console.log('starting local video');
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = true;
          this.isBlack = false;
        });
      }

      this.localStream.getAudioTracks().forEach(audioTrack => {
        audioTrack.enabled = true;
      });

      this.localVideo.nativeElement.srcObject = this.localStream;

      this.localVideoActive = !this.localVideoActive;
    }
  }


  toggleAudio(): void {
    if (this.localStream) {
      const audioEnabled = this.localStream.getAudioTracks()[0].enabled;
      this.localStream.getAudioTracks().forEach(audioTrack => {
        audioTrack.enabled = !audioEnabled;
      });
    }
  }


}

