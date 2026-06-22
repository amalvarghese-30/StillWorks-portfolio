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
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              }}
            />

        </div>
    );
};

export default HeroBackground;