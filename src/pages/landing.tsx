import { useNavigate } from "react-router-dom";
import image1 from '../assets/img1.jpg';
import image2 from '../assets/img2.jpg';
import image3 from '../assets/img3.jpg';
import SalaryTable from '../components/salarytable';
import { motion } from "framer-motion"; // correction du mauvais import

const Landing = () => {
    const navigate = useNavigate();

    const scrollToTable = () => {
        const table = document.getElementById("salaryTableSection");
        if (table) {
            table.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <main className='flex justify-center items-center flex-col'>
            <nav className='flex justify-center items-center w-screen'>
                <p className='font-extrabold mb-5 text-[20px] lg:text-3xl'>salairestech.</p>
            </nav>

            <div className="flex flex-col items-center justify-center">
                {/* Titre principal */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                    viewport={{ once: true }}
                    className='text-center'
                >
                    <p className='font-extrabold text-[32px] sm:text-[48px] md:text-[64px] lg:text-[72px] xl:text-[80px] leading-[1.2]'>
                        Les salaires des acteurs<br />
                        de la tech <span className='text-orange-500'>ivoirienne</span>
                    </p>
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    viewport={{ once: true }}
                    className='text-center text-[15px] lg:text-[18px] xl:text-[20px] mt-4 text-gray-600'
                >
                    Une base de données ouverte et anonyme sur les salaires des <br />
                    professionnels du numérique : développeurs, designers, data, et plus.
                </motion.p>

                {/* Boutons CTA */}
                <div className="flex mt-6 gap-4 mb-10">
                    <button
                        onClick={() => navigate("/ajouter-salaire")}
                        className='bg-black px-6 py-3 text-white rounded-lg hover:bg-gray-800 transition'
                    >
                        Ajouter mon salaire
                    </button>
                    <button
                        onClick={scrollToTable}
                        className='border border-black px-6 py-3 rounded-lg hover:bg-gray-100 transition'
                    >
                        Explorer les salaires
                    </button>
                </div>

                {/* Cartes métiers */}
                <div className="hidden md:flex gap-10">
                    {[image1, image2, image3].map((image, index) => {
                        const delays = [0, 0.2, 0.4];
                        const titles = [
                            "Data scientist\n/ Analyst",
                            "Ingénieur\nCybersécurité",
                            "Développeurs\nd'applications"
                        ];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: delays[index] }}
                                viewport={{ once: true }}
                                className="w-[315px] h-[464px] bg-cover bg-center rounded-lg shadow-lg relative hover:scale-105 transition-transform duration-300"
                                style={{ backgroundImage: `url(${image})` }}
                            >
                                <div className="absolute inset-0 bg-black/40 flex items-end rounded-lg">
                                    <p className="text-white font-semibold p-4 leading-snug text-[20px] text-start whitespace-pre-line">
                                        {titles[index]}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tableau des salaires */}
                <div
                    id="salaryTableSection"
                    className="flex flex-col md:mt-40 w-screen items-center justify-center"
                >
                    <p className='text-3xl font-extrabold mb-3 text-center'>
                        Découvrez les salaires de la tech en Côte d’Ivoire
                    </p>
                    <SalaryTable />
                </div>
            </div>
        </main>
    );
};

export default Landing;
