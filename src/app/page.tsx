import { redirect } from 'next/navigation';

export default function Home() {
  // This forces the official link to open your Intelligent Hub
  redirect('/dashboard');
}