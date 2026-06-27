import { motion } from "framer-motion";

const HeroBackground = ({ isInView }: { isInView: boolean }) => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">

            {/* Gradient blur circle 1 */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl"
                style={{ willChange: "transform" }}
                animate={isInView ? { x: [0, 40, 0], y: [0, 60, 0] } : { x: 0, y: 0 }}
                transition={isInView ? { duration: 18, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />

            {/* Gradient blur circle 2 */}
            <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-3xl"
                style={{ willChange: "transform" }}
                animate={isInView ? { x: [0, -40, 0], y: [0, -60, 0] } : { x: 0, y: 0 }}
                transition={isInView ? { duration: 20, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />

            {/* subtle noise overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              }}
              animate={{ opacity: isInView ? 0.03 : 0 }}
              transition={{ duration: 0.3 }}
            />

        </div>
    );
};

export default HeroBackground;