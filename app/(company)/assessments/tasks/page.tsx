import ComingSoon from "@/app/components/coming-soon";
import Header from "../../components/Header";

export default function Page() {
    return (
        <div className="flex h-screen bg-green-50 overflow-hidden">
            <main className="flex-1 h-full overflow-y-auto p-6">
                <Header />
                <ComingSoon />
            </main>
        </div>
    );
}
