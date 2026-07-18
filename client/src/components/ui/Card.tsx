import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`} {...props} />;
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => {
  return <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
};
