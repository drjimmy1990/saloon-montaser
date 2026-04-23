const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'components', 'sections', 'chat-section.tsx');
let data = fs.readFileSync(targetPath, 'utf8');

// 1. Rename Interface
data = data.replace(
`interface Conversation {
  id: string;
  channelType: ChannelType;
  clientName: string;
  clientPhone: string;
  messages: ChatMessage[];
  status: string;
  updatedAt: string;
}`,
`interface Contact {
  id: string;
  channel_id: string;
  platform: ChannelType;
  platform_user_id: string;
  name: string;
  avatar_url: string;
  last_interaction_at: string;
  last_message_preview: string;
  unread_count: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}`
);

// 2. State variables & functions
data = data.replace(/const \[conversations, setConversations\] = useState<Conversation\[\]>\(\[\]\);/g, 'const [contacts, setContacts] = useState<Contact[]>([]);');
data = data.replace(/const \[activeConvId, setActiveConvId\] = useState<string \| null>\(null\);/g, 'const [activeContactId, setActiveContactId] = useState<string | null>(null);');
data = data.replace(/const \[blockDialogConvId, setBlockDialogConvId\] = useState<string \| null>\(null\);/g, 'const [blockDialogContactId, setBlockDialogContactId] = useState<string | null>(null);');
data = data.replace(/const fetchConversations = async \(\) => {/g, 'const fetchContacts = async () => {');
data = data.replace(/fetch\("\/api\/conversations"\)/g, 'fetch("/api/contacts")');
data = data.replace(/setConversations\(Array.isArray\(data\) \? data : \[\]\)/g, 'setContacts(Array.isArray(data) ? data : [])');
data = data.replace(/fetchConversations\(\)/g, 'fetchContacts()');
data = data.replace(/activeConvId/g, 'activeContactId');
data = data.replace(/const activeConversation = conversations\.find\(\(c\) => c\.id === activeContactId\) \|\| null;/g, 'const activeContact = contacts.find((c) => c.id === activeContactId) || null;');
data = data.replace(/activeConversation/g, 'activeContact');
data = data.replace(/conversations\.find/g, 'contacts.find');
data = data.replace(/conversations\.length/g, 'contacts.length');
data = data.replace(/conversations\.map/g, 'contacts.map');
data = data.replace(/setConversations/g, 'setContacts');
data = data.replace(/blockDialogConvId/g, 'blockDialogContactId');
data = data.replace(/setBlockDialogConvId/g, 'setBlockDialogContactId');
data = data.replace(/blockTargetConv/g, 'blockTargetContact');
data = data.replace(/handleSelectConversation/g, 'handleSelectContact');
data = data.replace(/handleNewConversation/g, 'handleNewContact');

// 3. API Calls
data = data.replace(/fetch\(\`\/api\/conversations\/\$\{convId\}\`\,/g, 'fetch(`/api/contacts/${contactId}`,');
data = data.replace(/const handleToggleBlock = async \(convId: string\) => {/g, 'const handleToggleBlock = async (contactId: string) => {');
data = data.replace(/const conv = contacts\.find\(\(c\) => c\.id === convId\);/g, 'const conv = contacts.find((c) => c.id === contactId);');

// 4. Object properties mappings in render
data = data.replace(/conv\.channelType/g, 'conv.platform');
data = data.replace(/conv\.clientName/g, 'conv.name');
data = data.replace(/activeContact\.channelType/g, 'activeContact.platform');
data = data.replace(/activeContact\.clientName/g, 'activeContact.name');

// 5. Update lastMsg logic
const oldLastMsgLogic = `const lastMsgObj = conv.messages[conv.messages.length - 1];
              const lastMsgText = lastMsgObj ? lastMsgObj.text_content : (rtl ? "لا يوجد رسائل" : "No messages");
              const lastMsgTime = lastMsgObj ? new Date(lastMsgObj.platform_timestamp || lastMsgObj.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";`;

const newLastMsgLogic = `const lastMsgText = conv.last_message_preview || (rtl ? "لا يوجد رسائل" : "No messages");
              const lastMsgTime = conv.last_interaction_at ? new Date(conv.last_interaction_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";`;
data = data.replace(oldLastMsgLogic, newLastMsgLogic);

// Add unread count UI
const nameAndBadgeLogic = `<span className={cn("text-xs font-medium truncate", rtl && "font-arabic")}>
                              {conv.name}
                            </span>
                            {isBlocked && (
                              <Badge
                                variant="destructive"
                                className="text-[8px] px-1 py-0 h-3.5 leading-none shrink-0"
                              >
                                {rtl ? "محظور" : "Blocked"}
                              </Badge>
                            )}`;

const newNameAndBadgeLogic = `<span className={cn("text-xs font-medium truncate", rtl && "font-arabic")}>
                              {conv.name || conv.platform_user_id}
                            </span>
                            {conv.unread_count > 0 && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 leading-none shrink-0 rounded-full bg-primary text-primary-foreground">
                                {conv.unread_count}
                              </Badge>
                            )}
                            {isBlocked && (
                              <Badge
                                variant="destructive"
                                className="text-[8px] px-1 py-0 h-3.5 leading-none shrink-0"
                              >
                                {rtl ? "محظور" : "Blocked"}
                              </Badge>
                            )}`;
data = data.replace(nameAndBadgeLogic, newNameAndBadgeLogic);

// Fix New Conversation POST
data = data.replace(/channelType: "whatsapp",/g, 'platform: "whatsapp",\n          platform_user_id: "new_client_" + Date.now(),');
data = data.replace(/clientName:/g, 'name:');
data = data.replace(/clientPhone: "",\n\s*messages: \[\],/g, '');

fs.writeFileSync(targetPath, data);
console.log("Refactored chat-section.tsx");
