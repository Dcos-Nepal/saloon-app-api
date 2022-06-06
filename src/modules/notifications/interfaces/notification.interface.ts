export interface INotification {
  _id?: string;
  title: string;
  description?: string;
  path?: string;
  isRead?: boolean;
  receiver?: string;
}

export interface Notification extends INotification, Document {
  _id?: string;
}
