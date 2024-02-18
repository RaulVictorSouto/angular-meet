export interface Message {
  type: string;
  data: any;
  sender: string;
  recipient?: string;
  receiver: string;
}

