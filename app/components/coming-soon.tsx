"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

export default function ComingSoon({
    title = "Coming Soon",
    subtitle = "This feature is coming soon. Check back later!",
    backTo = "/",
}: {
    title?: string;
    subtitle?: string;
    backTo?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
            >
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="inline-block"
                        >
                            <Clock className="w-16 h-16 text-primary" />
                        </motion.div>
                        <Sparkles className="absolute -top-3 -right-3 w-6 h-6 text-yellow-500 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">{title}</h1>
                <p className="text-muted-foreground mb-6">{subtitle}</p>

                <Button asChild size="lg">
                    <Link href={backTo}>Back to Dashboard</Link>
                </Button>
            </motion.div>
        </div>
    );
}
