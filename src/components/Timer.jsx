import React, { useState, useEffect } from 'react';

const Timer = ({ seconds, onExpire, onReset }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onExpire && onExpire();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onExpire]);

  const handleReset = () => {
    setTimeLeft(seconds);
    setIsActive(true);
    onReset && onReset();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="text-center">
        <div className="text-lg font-bold text-[#D72638]">
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-500">
          Time remaining
        </div>
      </div>
      
      {!isActive && (
        <button
          onClick={handleReset}
          className="ml-2 px-3 py-1 text-xs bg-[#FFD700] text-[#000000] rounded-md hover:bg-[#FFD700] transition"
        >
          Resend
        </button>
      )}
    </div>
  );
};

export default Timer;


