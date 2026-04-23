const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'sections', 'chat-section.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Rename Contact to Client
content = content.replace(/interface Contact /g, 'interface Client ');
content = content.replace(/Contact\[\]/g, 'Client[]');
content = content.replace(/<Contact>/g, '<Client>');
content = content.replace(/const activeContact /g, 'const activeClient ');
content = content.replace(/activeContact\./g, 'activeClient.');
content = content.replace(/activeContact\?/g, 'activeClient?');
content = content.replace(/activeContact,/g, 'activeClient,');
content = content.replace(/activeContact\)/g, 'activeClient)');
content = content.replace(/!activeContact/g, '!activeClient');

// 2. Rename contacts/fetchContacts
content = content.replace(/contacts,/g, 'clients,');
content = content.replace(/contacts\./g, 'clients.');
content = content.replace(/setContacts/g, 'setClients');
content = content.replace(/fetchContacts/g, 'fetchClients');
content = content.replace(/\[contacts\]/g, '[clients]');

// 3. Rename contact_id to client_id in messages
content = content.replace(/contact_id:/g, 'client_id:');
content = content.replace(/contact_id/g, 'client_id');

// 4. API endpoints
content = content.replace(/"\/api\/contacts"/g, '"/api/clients"');

// 5. Global State activeChatId instead of local activeContactId
content = content.replace(/const \[activeContactId, setActiveContactId\] = useState<string \| null>\(null\);/g, '');
content = content.replace(/const { locale } = useAppStore\(\);/g, 'const { locale, activeChatId, setActiveChatId } = useAppStore();');
content = content.replace(/activeContactId/g, 'activeChatId');
content = content.replace(/setActiveContactId/g, 'setActiveChatId');

// 6. Fix handleSelectContact
content = content.replace(/handleSelectContact/g, 'handleSelectClient');
content = content.replace(/handleNewContact/g, 'handleNewClient');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactored chat-section.tsx for unified Client schema');
