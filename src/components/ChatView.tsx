import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, ArrowLeft, ArrowUpRight, Search, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, FriendItem } from '../types';
import { getChatId, sendChatMessage, subscribeToChatMessages, getAllUsernames } from '../services/resultService';

interface ChatViewProps {
  initialChatFriend?: string; // username
  onViewResults: (username: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  initialChatFriend,
  onViewResults,
}) => {
  const { profile, friends } = useAuth();
  const [allUsers, setAllUsers] = useState<{ username: string; displayName: string; avatar: string; uid?: string }[]>([]);
  const [activePartner, setActivePartner] = useState<{
    uid: string;
    username: string;
    displayName: string;
    avatar: string;
  } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all users
  useEffect(() => {
    getAllUsernames().then((list) => {
      setAllUsers(list);
    });
  }, []);

  // Set active partner from prop or first friend
  useEffect(() => {
    if (initialChatFriend) {
      const clean = initialChatFriend.replace('@', '').toLowerCase();
      const match = allUsers.find((u) => u.username.toLowerCase() === clean);
      if (match) {
        setActivePartner({
          uid: match.uid || 'demo_user_' + match.username,
          username: match.username,
          displayName: match.displayName,
          avatar: match.avatar,
        });
        return;
      }
    }

    if (!activePartner && friends.length > 0) {
      setActivePartner({
        uid: friends[0].friendUid,
        username: friends[0].username,
        displayName: friends[0].displayName,
        avatar: friends[0].avatar,
      });
    } else if (!activePartner && allUsers.length > 0) {
      const firstOther = allUsers.find((u) => u.username !== profile?.username) || allUsers[0];
      setActivePartner({
        uid: firstOther.uid || 'demo_user_' + firstOther.username,
        username: firstOther.username,
        displayName: firstOther.displayName,
        avatar: firstOther.avatar,
      });
    }
  }, [initialChatFriend, friends, allUsers, profile]);

  // Subscribe to messages between current user and active partner
  useEffect(() => {
    if (!profile || !activePartner) return;
    const currentUid = profile.uid;
    const partnerUid = activePartner.uid;
    const chatId = getChatId(currentUid, partnerUid);

    const unsub = subscribeToChatMessages(chatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [profile, activePartner]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !profile || !activePartner) return;

    const currentUid = profile.uid;
    const partnerUid = activePartner.uid;
    const chatId = getChatId(currentUid, partnerUid);

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      chatId,
      senderUid: currentUid,
      senderUsername: profile.username,
      senderDisplayName: profile.displayName,
      senderAvatar: profile.avatar,
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setInputText('');
    await sendChatMessage(newMsg);
  };

  const filteredPeers = allUsers.filter((u) => {
    if (u.username.toLowerCase() === profile?.username.toLowerCase()) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs h-[640px] flex">
      {/* Left Sidebar: Conversations & Friends */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <span>Direct Chat</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              @{profile?.username}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter friends by name or @handle..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-mono"
            />
          </div>
        </div>

        {/* Peers list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredPeers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              No matching friends found
            </div>
          ) : (
            filteredPeers.map((peer) => {
              const isSelected = activePartner?.username.toLowerCase() === peer.username.toLowerCase();
              return (
                <button
                  key={peer.username}
                  onClick={() => {
                    setActivePartner({
                      uid: peer.uid || 'demo_user_' + peer.username,
                      username: peer.username,
                      displayName: peer.displayName,
                      avatar: peer.avatar,
                    });
                  }}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-white border-l-2 border-slate-900 shadow-xs' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <span className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-lg shrink-0">
                    {peer.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {peer.displayName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 truncate block">
                      @{peer.username}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main Chat Window */}
      <div className={`flex-1 flex flex-col bg-white ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePartner(null)}
                  className="md:hidden p-1 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shrink-0">
                  {activePartner.avatar}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {activePartner.displayName}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    @{activePartner.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewResults(activePartner.username)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Scorecard</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <span className="text-3xl mb-2">{activePartner.avatar}</span>
                  <p className="text-xs font-medium text-slate-700 mb-1">
                    Start a conversation with @{activePartner.username}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Discuss exam strategies, study tips, or congratulate each other on recent scores.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderUid === profile?.uid || m.senderUsername === profile?.username;
                  const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[80%] sm:max-w-[70%]">
                        {!isMine && (
                          <span className="text-xs select-none mb-1">{activePartner.avatar}</span>
                        )}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                        {time}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder={`Message @${activePartner.username}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
            <p className="text-xs">Select a friend to begin chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
