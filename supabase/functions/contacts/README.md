# Contacts Edge Function

This Supabase Edge Function provides CRUD operations for managing contacts (email and SMS) for each doctor/user.

## Endpoints

- **POST** `/contacts` — Accepts JSON body with:
  - `action`: 'list' | 'add' | 'update' | 'delete'
  - `doctor_id`: string (required)
  - `contact`: object (for add/update)
  - `id`: string (for update/delete)

## Example Requests

### List Contacts
```json
{
  "action": "list",
  "doctor_id": "<doctor_id>"
}
```

### Add Contact
```json
{
  "action": "add",
  "doctor_id": "<doctor_id>",
  "contact": {
    "type": "email",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Update Contact
```json
{
  "action": "update",
  "doctor_id": "<doctor_id>",
  "id": "<contact_id>",
  "contact": {
    "name": "Jane Doe"
  }
}
```

### Delete Contact
```json
{
  "action": "delete",
  "doctor_id": "<doctor_id>",
  "id": "<contact_id>"
}
``` 