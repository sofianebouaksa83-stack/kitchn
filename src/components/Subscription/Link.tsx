import { ReactNode } from 'react';

interface LinkProps {
  to: string;
  className?: string;
  children: ReactNode;
}

export function Link({ to, className = '', children }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = to;
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
