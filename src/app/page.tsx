import { redirect } from 'next/navigation';

export default function Home() {
  // This instantly sends the user to the Intelligence Hub
  redirect('/dashboard');
}