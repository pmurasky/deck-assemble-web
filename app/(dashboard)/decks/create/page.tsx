import { redirect } from 'next/navigation';

export default function CreateDeckPage() {
  redirect('/decks?create=true');
}
