import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import {
    type ColumnDef,
    flexRender,
    useReactTable,
    getCoreRowModel,
} from '@tanstack/react-table';
import { supabase } from '../supabaseClient';

// Formatters
const formatAnnee = (val: unknown) => {
    const n = Number(val);
    return isNaN(n) ? '-' : `${n} an${n > 1 ? 's' : ''}`;
};
const formatRemuneration = (rem: string) => {
    const num = Number(rem.replace(/[^0-9.-]+/g, ''));
    return isNaN(num) ? rem : num.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('fr-FR');
};

type SalaryEntry = {
    id: string;
    entreprise: string;
    poste: string;
    localisation: string;
    remuneration: string;
    exp_entreprise: number;
    exp_totale: number;
    niveau: string;
    modalite_travail: string;
    date_ajout: string;
};

export default function SalaryTable() {
    const [data, setData] = useState<SalaryEntry[]>([]);
    const [villesOptions, setVillesOptions] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [params, setParams] = useSearchParams();
    const recherche = params.get('recherche') || '';
    const localisation = params.get('localisation') || '';
    const niveau = params.get('niveau') || '';
    const exp = params.get('exp') || '';
    const page = Number(params.get('page') || 0);
    const pageSize = 30;

    const tri = params.get('tri') || 'date_ajout';
    const sens = params.get('sens') || 'desc';

    const updateParam = (key: string, value: string | number) => {
        const newParams = new URLSearchParams(params);
        if (value) newParams.set(key, String(value));
        else newParams.delete(key);
        setParams(newParams);
    };

    useEffect(() => {
        const fetchVilles = async () => {
            const { data, error } = await supabase.from('villes').select('nom_ville');
            if (!error && data) {
                setVillesOptions(data.map(p => ({ label: p.nom_ville, value: p.nom_ville })));
            }
        };
        fetchVilles();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        const [{ data, error }, { data: countData, error: countError }] = await Promise.all([
            supabase.rpc('get_salaires', {
                filtre_localisation: localisation || null,
                filtre_niveau: niveau || null,
                filtre_exp: exp ? Number(exp) : null,
                filtre_recherche: recherche || null,
                tri_colonne: tri,
                tri_sens: sens,
                page_index: page,
                page_size: pageSize,
            }),
            supabase.rpc('count_salaires', {
                filtre_localisation: localisation || null,
                filtre_niveau: niveau || null,
                filtre_exp: exp ? Number(exp) : null,
                filtre_recherche: recherche || null,
            }),
        ]);

        if (error) console.error('get_salaires error:', error.message);
        else setData(data);

        if (countError) console.error('count_salaires error:', countError.message);
        else setTotalCount(countData);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const columns: ColumnDef<SalaryEntry>[] = [
        { accessorKey: 'entreprise', header: 'Entreprise' },
        { accessorKey: 'poste', header: "Intitulé du poste" },
        { accessorKey: 'localisation', header: 'Localisation' },
        {
            accessorKey: 'remuneration',
            header: 'Rémunération brut en FCFA / an',
            cell: info => formatRemuneration(info.getValue() as string)
        },
        {
            accessorKey: 'exp_entreprise',
            header: 'Expérience entreprise\nen années',
            cell: info => formatAnnee(info.getValue())
        },
        {
            accessorKey: 'exp_totale',
            header: 'Expérience totale\nen années',
            cell: info => formatAnnee(info.getValue())
        },
        { accessorKey: 'niveau', header: 'Niveau' },
        { accessorKey: 'modalite_travail', header: 'Modalités de télétravail' },
        {
            accessorKey: 'date_ajout',
            header: "Date d'ajout",
            cell: info => formatDate(info.getValue() as string)
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="p-4 w-[90%]">
            {/* Filtres */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                <input
                    type="text"
                    value={recherche}
                    onChange={(e) => updateParam('recherche', e.target.value)}
                    placeholder="Recherche (entreprise ou poste)"
                    className="border px-2 py-1 rounded md:w-80 w-[100%]"
                />

                <Select
                    options={villesOptions}
                    value={villesOptions.find(v => v.value === localisation)}
                    className="md:w-60 w-[100%]"
                    onChange={(selected) => updateParam('localisation', selected?.value || '')}
                />

                <select
                    value={niveau}
                    onChange={(e) => updateParam('niveau', e.target.value)}
                    className="border px-2 py-1 rounded md:w-40 w-[100%] "
                >
                    <option value="">Niveau</option>
                    <option value="Junior">Junior</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Senior">Senior</option>
                </select>

                <input
                    type="number"
                    value={exp}
                    onChange={(e) => updateParam('exp', e.target.value)}
                    placeholder="Expérience (ans)"
                    className="border px-2 py-1 rounded md:w-60 w-[100%]"
                />

                <button
                    onClick={() => setParams({})}
                    className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 md:w-40 w-[100%]"
                >
                     Réinitialiser
                </button>
            </div>

            {/* Total */}
            <div className="text-sm text-gray-700 mb-2">
                {loading ? 'Chargement...' : `${totalCount} résultat${totalCount > 1 ? 's' : ''} au total`}
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm border">
                    <thead className="bg-gray-100">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th className="px-4 py-2 text-left font-semibold" key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="text-center">Chargement...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={9} className="text-center">Aucune donnée</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="border-t">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="text-start px-4 py-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    disabled={page === 0}
                    onClick={() => updateParam('page', page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    ← Précédent
                </button>
                <span className="text-sm">
                    Page {page + 1} sur {totalPages}
                </span>
                <button
                    disabled={data.length < pageSize}
                    onClick={() => updateParam('page', page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
}