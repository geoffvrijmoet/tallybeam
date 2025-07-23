"use client";

// Force dynamic rendering to prevent static generation issues with Clerk
export const dynamic = 'force-dynamic';

import { SignUp } from "@clerk/nextjs";

// Prevent static generation
export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white",
          }
        }}
      />
    </div>
  );
} 