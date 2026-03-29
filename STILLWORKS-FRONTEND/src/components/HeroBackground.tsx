import { motion } from "framer-motion";

const HeroBackground = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">

            {/* Gradient blur circle 1 */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl"
                animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Gradient blur circle 2 */}
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl"
                animate={{ x: [0, -40, 0], y: [0, -60, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* subtle noise overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />

        </div>
    );
};

export default HeroBackground;