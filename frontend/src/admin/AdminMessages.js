import React, { useState, useEffect } from 'react';
import { getContactMessages, markMessageRead } from '../services/api';
import { Mail, MailOpen, Phone, Clock, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getContactMessages();
      setMessages(res.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleView = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.read) {
      await markMessageRead(message.id);
      fetchData();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Contact Messages</h2>
        <span className="text-sm text-gray-500">{messages.filter(m => !m.read).length} unread</span>
      </div>

      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            onClick={() => handleView(message)}
            className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${!message.read ? 'border-l-4 border-l-primary-500' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${message.read ? 'bg-gray-100' : 'bg-primary-50'}`}>
                  {message.read ? <MailOpen size={20} className="text-gray-500" /> : <Mail size={20} className="text-primary-600" />}
                </div>
                <div>
                  <h3 className={`font-medium ${message.read ? 'text-gray-700' : 'text-gray-900'}`}>{message.subject}</h3>
                  <p className="text-sm text-gray-500">{message.name} • {message.email}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{message.message}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  {format(parseISO(message.created_at), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Mail className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No messages yet</p>
          </div>
        )}
      </div>

      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedMessage.subject}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedMessage.name}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <a href={`tel:${selectedMessage.phone}`} className="text-sm text-primary-600 flex items-center gap-1 mt-1">
                      <Phone size={14} /> {selectedMessage.phone}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {format(parseISO(selectedMessage.created_at), 'PPp')}
                  </p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.message}</p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`} className="btn-primary flex-1 text-center">
                Reply via Email
              </a>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
