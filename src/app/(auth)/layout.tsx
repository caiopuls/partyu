import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center px-4 py-6 sm:px-0">
      {children}
    </div>
  );
}



