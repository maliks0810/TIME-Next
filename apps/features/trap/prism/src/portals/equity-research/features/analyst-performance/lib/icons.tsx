import React, { useId } from 'react';

export default function ExcelIcon() {
  const gradId = useId(); // unique + stable

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="32px" height="32px">
      <defs>
        <linearGradient
          id={gradId}
          x1="6"
          x2="27"
          y1="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#21ad64" />
          <stop offset="1" stopColor="#088242" />
        </linearGradient>
      </defs>

      <path fill="#31c447" d="m41,10h-16v28h16c.55,0,1-.45,1-1V11c0-.55-.45-1-1-1Z" />
      <path fill="#fff" d="m32,15h7v3h-7v-3Zm0,10h7v3h-7v-3Zm0,5h7v3h-7v-3Zm0-10h7v3h-7v-3Zm-7-5h5v3h-5v-3Zm0,10h5v3h-5v-3Zm0,5h5v3h-5v-3Zm0-10h5v3h-5v-3Z" />

      {/* Use the unique gradient id here */}
      <path fill={`url(#${gradId})`} d="m27,42l-21-4V10l21-4v36Z" />

      <path
        fill="#fff"
        d="m19.13,31l-2.41-4.56c-.09-.17-.19-.48-.28-.94h-.04c-.05.22-.15.54-.32.98l-2.42,4.52h-3.76l4.46-7-4.08-7h3.84l2,4.2c.16.33.3.73.42,1.18h.04c.08-.27.22-.68.44-1.22l2.23-4.16h3.51l-4.2,6.94,4.32,7.06h-3.74Z"
      />
    </svg>
  );
}