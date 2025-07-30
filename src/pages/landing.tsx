import { useNavigate } from "react-router-dom";
import image1 from '../assets/img1.jpg';
import image2 from '../assets/img2.jpg';
import image3 from '../assets/img3.jpg';
import SalaryTable from '../components/salarytable';

import { motion } from "motion/react"

const Landing = () => {
    const navigate = useNavigate();
    return (
        <main className='flex justify-center items-center flex-col'>
            <nav className='flex justify-center items-center w-screen ps-10'>
                <p className='font-extrabold mb-5 text-[20px] lg:text-3xl'>salairestech.</p>
            </nav>
            <div className="flex flex-col items-center justify-center">
                {/* Animation sur le texte */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.5 }}
                    viewport={{ once: true }}
                    className='flex flex-col justify-center items-center'
                >
                    <p className='font-extrabold text-[32px] sm:text-[48px] md:text-[64px] lg:text-[72px] xl:text-[80px] leading-[1.2]'>Les salaires des acteurs
                        <br></br>de la tech <span className='orange'>ivoirienne</span></p>
                    <p className='text-[15px]  lg:text-[18px] xl:text-[20px] mt-2'>Une base de données ouverte et anonyme sur les salaires des <br></br> professionnels
                        du numérique : développeurs, designers, data, et plus.</p>

                    <div className="flex mt-3 gap-6 mb-6">
                        <button onClick={() => navigate("/ajouter-salaire")} className='bg-black p-4 text-white rounded-md  cursor-pointer' >
                            Ajouter mon salaire
                        </button>

                    </div>
                </motion.h1>

                <div className="hidden md:flex gap-10 ">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0 }}
                        viewport={{ once: true }}
                        className="w-[315px] h-[464px] bg-cover bg-center rounded-lg shadow-lg relative"
                        style={{ backgroundImage: `url(${image1})` }}
                    >
                        <div className="absolute inset-0 bg-black/40 flex items-end rounded-lg">
                            <p className="text-white font-semibold p-4 leading-snug text-[20px] text-start">
                                Data scientist<br />
                                / Analyst
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="w-[315px] h-[464px] bg-cover bg-center rounded-lg shadow-lg relative top-25"
                        style={{ backgroundImage: `url(${image2})` }}
                    >
                        <div className="absolute inset-0 bg-black/40 flex items-end rounded-lg">
                            <p className="text-white font-semibold p-4 leading-snug text-[20px] text-start">
                                Ingénieur <br />
                                Cybersécurité
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="w-[315px] h-[464px] bg-cover bg-center rounded-lg shadow-lg relative"
                        style={{ backgroundImage: `url(${image3})` }}
                    >
                        <div className="absolute inset-0 bg-black/40 flex items-end rounded-lg">
                            <p className="text-white font-semibold p-4 leading-snug text-[20px] text-start">
                                Développeurs<br />
                                d'applications
                            </p>
                        </div>
                    </motion.div>
                </div>
                <div className="flex flex-col md:mt-40 w-screen  items-center justify-center">
                    <p className='text-3xl font-extrabold mb-3'>Tableau des salaires</p>
                    <SalaryTable />
                </div>

            </div>
        </main>
    )
}

export default Landing