export interface Contact {
  id: string;
  doctor_id: string;
  type: 'email' | 'sms';
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactsRequest {
  action: 'list' | 'add' | 'update' | 'delete';
  doctor_id: string;
  contact?: Partial<Contact>;
  id?: string;
} 