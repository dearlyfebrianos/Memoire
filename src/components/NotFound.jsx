import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Text */}
        <motion.div variants={itemVariants}>
          <motion.h1
            className="text-9xl md:text-10xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4 drop-shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            404
          </motion.h1>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-white mb-4 relative"
          variants={itemVariants}
        >
          <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Halaman Tidak Ditemukan
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-gray-300 mb-8 text-lg md:text-xl max-w-md mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </motion.p>

        {/* Button */}
        <motion.div variants={itemVariants}>
          <Link to="/">
            <motion.button
              className="px-8 md:px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 backdrop-blur-md border border-white/20 text-lg"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Kembali ke Beranda
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
