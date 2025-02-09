import { Card } from '@/components/ui/card';
import IndividualPractice from '@/pages/IndividualPractice';
export default function PracticeRoom() {
    return (
        <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed">
        <div className="min-h-screen backdrop-blur-sm bg-black/40">
            <div className="container mx-auto pt-4">
            
            <div className="mt-6">
                <Card className="backdrop-blur-md bg-black/30 border-none shadow-2xl">
                <IndividualPractice />
                </Card>
            </div>
            </div>
        </div>
        </div>
    );
}