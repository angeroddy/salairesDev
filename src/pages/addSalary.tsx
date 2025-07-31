import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../supabaseClient';
import Select from 'react-select';

const niveaux = [
    { label: 'Junior', value: 'Junior' },
    { label: 'Mid', value: 'Mid' },
    { label: 'Senior', value: 'Senior' },
];

const modalites = [
    { label: 'Présentiel', value: 'Présentiel' },
    { label: 'Hybride', value: 'Hybride' },
    { label: 'Full Remote', value: 'Full Remote' },
];

interface FormData {
    email: string;
    entreprise: string;
    poste: { label: string; value: string };
    localisation: { label: string; value: string };
    niveau: { label: string; value: string };
    modalite_travail: { label: string; value: string };
    remuneration: string;
    exp_entreprise: number;
    exp_totale: number;
}

export default function AddSalary() {
    const { register, handleSubmit, control, reset } = useForm<FormData>();
    const [message, setMessage] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const [postesOptions, setPostesOptions] = useState<{ label: string; value: string }[]>([]);
    const [villesOptions, setVillesOptions] = useState<{ label: string; value: string }[]>([]);
    const [forbiddenDomains, setForbiddenDomains] = useState<Set<string>>(new Set());

    useEffect(() => {
        document.body.classList.add('bg-gray-100');
        return () => {
            document.body.classList.remove('bg-gray-100');
        };
    }, []);

    useEffect(() => {
        const fetchPostes = async () => {
            const { data, error } = await supabase.from('postes').select('nom');
            if (!error && data) {
                setPostesOptions(data.map(p => ({ label: p.nom, value: p.nom })));
            }
        };
        fetchPostes();
    }, []);

    useEffect(() => {
        const fetchVilles = async () => {
            const { data, error } = await supabase.from('villes').select('nom_ville');
            if (!error && data) {
                setVillesOptions(data.map(p => ({ label: p.nom_ville, value: p.nom_ville })));
            }
        };
        fetchVilles();
    }, []);

    useEffect(() => {
        const loadForbiddenDomains = async () => {
            try {
                const res = await fetch("https://raw.githubusercontent.com/willwhite/freemail/master/data/free.txt");
                const text = await res.text();
                const domainSet = new Set(text.split("\n").map(d => d.trim().toLowerCase()));
                setForbiddenDomains(domainSet);
            } catch (error) {
                console.error("Erreur lors du chargement des domaines interdits :", error);
            }
        };
        loadForbiddenDomains();
    }, []);

    const isEmailPro = (email: string): boolean => {
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain) return false;
        return !forbiddenDomains.has(domain);
    };

    const onSubmit = async (data: FormData) => {
        if (submitting) return;
        setSubmitting(true);
        setMessage('');

        if (!isEmailPro(data.email)) {
            setMessage("❌ L'adresse email semble être personnelle (ex : gmail.com). Merci d'utiliser une adresse professionnelle.");
            setSubmitting(false);
            return;
        }

        const { data: existing, error: checkError } = await supabase
            .from('salaires_pending')
            .select('*')
            .eq('email', data.email)
            .eq('poste', data.poste.value)
            .eq('entreprise', data.entreprise);

        if (checkError) {
            setMessage("Erreur lors de la vérification des doublons : " + checkError.message);
            setSubmitting(false);
            return;
        }

        if (existing.length > 0) {
            setMessage("⚠️ Une soumission identique est déjà en attente de validation.");
            setSubmitting(false);
            return;
        }

        const { error: insertError } = await supabase.from('salaires_pending').insert({
            email: data.email,
            entreprise: data.entreprise,
            poste: data.poste.value,
            localisation: data.localisation.value,
            niveau: data.niveau.value,
            modalite_travail: data.modalite_travail.value,
            remuneration: data.remuneration,
            exp_entreprise: data.exp_entreprise,
            exp_totale: data.exp_totale,
        });

        if (insertError) {
            setMessage("Erreur lors de l'enregistrement : " + insertError.message);
            setSubmitting(false);
            return;
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
            email: data.email,
            options: {
                emailRedirectTo: `${window.location.origin}/confirm`,
            },
        });

        if (otpError) {
            setMessage("Erreur lors de l'envoi de l'email de confirmation : " + otpError.message);
            setSubmitting(false);
            return;
        }

        setMessage(`✅ Un lien de confirmation a été envoyé à ${data.email}. Veuillez cliquer dessus pour valider votre soumission.`);
        reset();
        setSubmitting(false);
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg border-1 border-solid border-stone-950">
            <h1 className="text-xl font-bold mb-4">Soumettre un salaire</h1>
            <div className="bg-orange-100 border border-orange-500 text-orange-800 text-sm p-4 mb-4 rounded">
                L’adresse email utilisée doit correspondre à celle de l’entreprise renseignée.
                Vous devez avoir accès à cette adresse pour valider votre soumission via le lien envoyé par mail.
                Sans validation, le salaire ne sera pas publié.
                Vos données sont automatiquement supprimées après validation ou, à défaut, dans un délai de 6 jours.
            </div>
            {typeof message === 'string' && (
                <p className={`mb-4 ${message.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm text-start">Adresse email professionnelle</label>
                    <input type="email" {...register('email', { required: true })} className="w-full border px-3 py-2 rounded" placeholder="prenom.nom@entreprise.ci" />
                </div>

                <div>
                    <label className="block text-sm text-start">Entreprise</label>
                    <input type="text" {...register('entreprise', { required: true })} className="w-full border px-3 py-2 rounded" placeholder="Ex: Wave, Orange, MTN..." />
                </div>

                <div>
                    <label className="block text-sm text-start">Intitulé du poste</label>
                    <Controller name="poste" control={control} render={({ field }) => <Select {...field} options={postesOptions} />} rules={{ required: true }} />
                </div>

                <div>
                    <label className="block text-sm text-start">Localisation</label>
                    <Controller name="localisation" control={control} render={({ field }) => <Select {...field} options={villesOptions} />} rules={{ required: true }} />
                </div>

                <div>
                    <label className="block text-sm text-start">Niveau</label>
                    <Controller name="niveau" control={control} render={({ field }) => <Select {...field} options={niveaux} />} />
                </div>

                <div>
                    <label className="block text-sm text-start">Modalité de travail</label>
                    <Controller name="modalite_travail" control={control} render={({ field }) => <Select {...field} options={modalites} />} />
                </div>

                <div>
                    <label className="block text-sm text-start">Rémunération brute annuelle (FCFA)</label>
                    <input type="text" {...register('remuneration', { required: true })} className="w-full border px-3 py-2 rounded" placeholder="Ex: 8 000 000 FCFA" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm text-start">Expérience dans l'entreprise (ans)</label>
                        <input type="number" {...register('exp_entreprise', { required: true })} className="w-full border px-3 py-2 rounded" />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm text-start">Expérience totale (ans)</label>
                        <input type="number" {...register('exp_totale', { required: true })} className="w-full border px-3 py-2 rounded" />
                    </div>
                </div>

                <button type="submit" disabled={submitting} className={`bg-black text-white px-4 py-2 rounded w-full cursor-pointer ${submitting ? 'opacity-50' : ''}`}>
                    {submitting ? "Soumission en cours..." : "Soumettre"}
                </button>
            </form>
        </div>
    );
}
