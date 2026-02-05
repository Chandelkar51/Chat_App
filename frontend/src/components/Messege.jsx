import React from 'react';
import moment from 'moment';

const Message = ({ message, isOwnMessage }) => {
  const renderContent = () => {
    if (message.deleted) {
      return <span className="text-gray-400 italic text-sm">🚫 {message.content}</span>;
    }

    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img 
              src={`http://localhost:8080${message.fileUrl}`} 
              alt={message.fileName}
              onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
              className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            />
            <p className="mt-2 text-sm">{message.content}</p>
          </div>
        );
      
      case 'file':
        return (
          <a 
            href={`http://localhost:8080${message.fileUrl}`}
            download={message.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 bg-black bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-colors no-underline"
          >
            <span className="text-2xl">📎</span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{message.fileName}</span>
              <span className="text-xs opacity-70">
                {(message.fileSize / 1024).toFixed(2)} KB
              </span>
            </div>
          </a>
        );
      
      default:
        return <p className="text-sm leading-relaxed break-words">{message.content}</p>;
    }
  };

  return (
    <div className={`flex gap-2.5 items-start animate-slide-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {!isOwnMessage && (
        <img 
          src={message.sender.avatar} 
          alt={message.sender.username}
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
      )}
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-gray-600 px-3">
            {message.sender.username}
          </span>
        )}
        
        <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
          isOwnMessage 
            ? 'bg-primary-500 text-white' 
            : 'bg-white text-gray-800'
        }`}>
          {renderContent()}
          <span className={`block mt-1 text-xs ${
            isOwnMessage ? 'text-white text-opacity-70' : 'text-gray-400'
          }`}>
            {moment(message.createdAt).format('HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;