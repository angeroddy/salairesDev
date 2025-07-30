import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Vérification en cours...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processConfirmation = async () => {
      try {
        // 🔑 Étape 1 : extraire le token OTP de l'URL
        const hash = window.location.hash;
        const access_token = new URLSearchParams(hash.substring(1)).get('access_token');
        const refresh_token = new URLSearchParams(hash.substring(1)).get('refresh_token');

        // 🔐 Étape 2 : établir la session Supabase si token présent
        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) {
            setMessage("❌ Impossible d'établir la session utilisateur.");
            setLoading(false);
            return;
          }
        }

        // 🔍 Étape 3 : récupérer l'utilisateur maintenant que la session est en place
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setMessage("❌ Vous n'êtes pas connecté. Veuillez utiliser le lien envoyé par email.");
          setLoading(false);
          return;
        }

        const email = user.email;

        // ✅ Vérification anti double soumission
        const { data: alreadyExists } = await supabase
          .from('salaires')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (alreadyExists) {
          setMessage("✅ Votre salaire a déjà été publié. Merci !");
          setLoading(false);
          return;
        }

        // 📥 Étape 4 : récupérer les lignes dans salaires_pending
        const { data: pending, error: fetchError } = await supabase
          .from('salaires_pending')
          .select('*')
          .eq('email', email);

        if (fetchError || !pending || pending.length === 0) {
          setMessage("❌ Aucune soumission trouvée à valider pour cet email.");
          setLoading(false);
          return;
        }

        // 📤 Étape 5 : insérer dans salaires
        const cleaned = pending.map(({ id, date_ajout, email, ...rest }) => rest);
        const { error: insertError } = await supabase.from('salaires').insert(cleaned);
        if (insertError) {
          setMessage("❌ Une erreur est survenue lors de la validation : " + insertError.message);
          setLoading(false);
          return;
        }

        // 🧹 Étape 6 : suppression des lignes temporaires
        const { error: deleteError } = await supabase
          .from('salaires_pending')
          .delete()
          .eq('email', email);

        if (deleteError) {
          setMessage("✔️ Salaire publié, mais erreur de nettoyage : " + deleteError.message);
        } else {
          setMessage('✅ Votre salaire a été publié avec succès ! Merci pour votre contribution.');
        }
      } catch (error) {
        console.error(error);
        setMessage("❌ Une erreur inattendue est survenue.");
      } finally {
        setLoading(false);
      }
    };

    processConfirmation();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-lg font-bold mb-4">Confirmation de votre soumission</h1>
      {loading ? (
        <p className="text-gray-500 animate-pulse">Chargement en cours...</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}
