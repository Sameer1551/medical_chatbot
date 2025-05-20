export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isEmergencyNumbers?: boolean;
}

export interface AyurvedicTip {
  tips: string[];
  precautions: string[];
}

export interface AyurvedicData {
  [condition: string]: AyurvedicTip;
}