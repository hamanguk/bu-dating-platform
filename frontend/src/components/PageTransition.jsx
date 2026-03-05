import { useState, useEffect } from 'react';

export default function PageTransition({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div className={`transition-all duration-200 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {children}
    </div>
  );
}
