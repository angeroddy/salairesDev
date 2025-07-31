import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ConfirmPage() {
  const [message, setMessage] = useState('Vérification en cours...');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const processConfirmation = async () => {
      try {
        // 🔑 1. Récupérer les tokens dans l'URL (#access_token=...)
        const hash = window.location.hash;
        if (!hash.includes('access_token')) {
          setMessage("⚠️ Merci de cliquer sur le lien contenu dans l’email pour confirmer.");
          return;
        }
        const params = new URLSearchParams(hash.substring(1));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

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

        // 2. Récupérer l'utilisateur connecté
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setMessage("❌ Vous n'êtes pas connecté. Veuillez utiliser le lien envoyé par email.");
          setLoading(false);
          return;
        }

        const email = user.email;

        // 3. Éviter la double insertion
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

        // 4. Récupérer les entrées temporaires
        const { data: pending, error: fetchError } = await supabase
          .from('salaires_pending')
          .select('*')
          .eq('email', email);

        if (fetchError || !pending || pending.length === 0) {
          setMessage("❌ Aucune soumission trouvée à valider pour cet email.");
          setLoading(false);
          return;
        }

        // 5. Nettoyage des champs
        const cleaned = pending.map(({ id, date_ajout, email, ...rest }) => rest);

        const { error: insertError } = await supabase.from('salaires').insert(cleaned);
        if (insertError) {
          setMessage("❌ Une erreur est survenue lors de la validation : " + insertError.message);
          setLoading(false);
          return;
        }

        // 6. Suppression de la table temporaire
        const { error: deleteError } = await supabase
          .from('salaires_pending')
          .delete()
          .eq('email', email);

        if (deleteError) {
          setMessage("✔️ Salaire publié, mais erreur de nettoyage : " + deleteError.message);
        } else {
          setMessage('✅ Votre salaire a été publié avec succès ! Merci pour votre contribution.');
        }

        // 7. Redirection après 6 secondes
        setTimeout(() => {
          navigate('/');
        }, 6000);
      } catch (e) {
        console.error(e);
        setMessage("❌ Une erreur inattendue est survenue.");
      } finally {
        setLoading(false);
      }
    };

    processConfirmation();
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-lg font-bold mb-4">Confirmation de votre soumission</h1>
      {loading ? (
        <p className="text-gray-500 animate-pulse">Chargement en cours...</p>
      ) : (
        <>
          <p>{message}</p>
          {message.startsWith("✅") && (
            <p className="mt-2 text-sm text-gray-500">
              Vous allez être redirigé automatiquement vers la page d’accueil...
            </p>
          )}
        </>
      )}
    </div>
  );
}
