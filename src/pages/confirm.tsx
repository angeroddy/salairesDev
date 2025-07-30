import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const processConfirmation = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage("❌ Vous n'êtes pas connecté. Veuillez utiliser le lien envoyé par email.");
        return;
      }

      const email = user.email;

      // 1. Récupérer les entrées de salaires_pending associées à cet email
      const { data: pending, error: fetchError } = await supabase
        .from('salaires_pending')
        .select('*')
        .eq('email', email);

      if (fetchError || !pending || pending.length === 0) {
        setMessage("❌ Aucune soumission trouvée à valider pour cet email.");
        return;
      }

      // 2. Copier vers la table finale 'salaires'
      const cleaned = pending.map(entry => {
        const { id, date_ajout, email, ...rest } = entry;
        return rest;
      });


      const { error: insertError } = await supabase.from('salaires').insert(cleaned);
      if (insertError) {
        setMessage("❌ Une erreur est survenue lors de la validation : " + insertError.message);
        return;
      }

      // 3. Supprimer les lignes de la table temporaire
      const { error: deleteError } = await supabase
        .from('salaires_pending')
        .delete()
        .eq('email', email);

      if (deleteError) {
        setMessage("✔️ Salaire publié, mais erreur de nettoyage : " + deleteError.message);
        return;
      }

      setMessage('✅ Votre salaire a été publié avec succès ! Merci pour votre contribution.');
    };

    processConfirmation();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-lg font-bold mb-4">Confirmation de votre soumission</h1>
      <p>{message}</p>
    </div>
  );
}