import { Link } from "@remix-run/react";

export interface ButtonProps {
  to: string;
  children: React.ReactNode;
}

export function Button({ to, children }: ButtonProps) {
  return (
    <Link
      to={to}
    >
        {children}
    </Link>
  );
}
