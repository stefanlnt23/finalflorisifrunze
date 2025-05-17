
import React from 'react';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  // Remove any non-numeric characters from the phone number
  const formattedNumber = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${formattedNumber}`;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition-colors duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <svg 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.4 4.6C17.3 2.5 14.5 1.3 11.5 1.3C5.4 1.3 0.5 6.2 0.5 12.3C0.5 14.3 1 16.3 2 18L0.4 23.7L6.2 22.1C7.8 23 9.6 23.5 11.5 23.5C17.6 23.5 22.5 18.6 22.5 12.5C22.5 9.5 21.4 6.7 19.4 4.6ZM11.5 21.6C9.8 21.6 8.1 21.1 6.7 20.2L6.3 20L2.9 21L3.9 17.7L3.6 17.3C2.6 15.8 2.1 14 2.1 12.2C2.1 7.1 6.3 2.9 11.4 2.9C13.9 2.9 16.2 3.9 17.9 5.6C19.6 7.3 20.6 9.6 20.6 12.1C20.7 17.3 16.5 21.6 11.5 21.6ZM16.6 14.7C16.3 14.6 15 13.9 14.7 13.8C14.4 13.7 14.2 13.7 14 14C13.8 14.3 13.2 14.9 13 15.1C12.8 15.3 12.7 15.4 12.4 15.2C12.1 15.1 11.2 14.8 10.2 13.9C9.4 13.2 8.8 12.3 8.7 12C8.5 11.7 8.7 11.5 8.8 11.3C8.9 11.2 9.1 11 9.2 10.8C9.3 10.6 9.4 10.5 9.5 10.3C9.6 10.1 9.5 9.9 9.4 9.8C9.3 9.7 8.8 8.4 8.5 7.8C8.3 7.2 8 7.3 7.8 7.3C7.6 7.3 7.4 7.3 7.2 7.3C7 7.3 6.7 7.4 6.4 7.7C6.1 8 5.4 8.7 5.4 10C5.4 11.3 6.3 12.5 6.4 12.7C6.5 12.9 8.7 16.3 12.1 17.5C12.9 17.8 13.5 18 14 18.2C14.8 18.4 15.6 18.4 16.2 18.3C16.9 18.2 17.9 17.5 18.2 16.8C18.5 16.1 18.5 15.5 18.4 15.4C18.3 15.3 18.1 15.2 17.8 15.1C17.5 14.9 16.9 14.8 16.6 14.7Z"
          />
        </svg>
      </a>
    </div>
  );
}
