import { Card } from '@/components/ui/card';
import IndividualPractice from '@/pages/IndividualPractice';

export default function PracticeRoom() {
    return (
        <div className="min-h-screen bg-cover bg-center bg-slate-900  relative">
            
            <div className="absolute inset-0 backdrop-blur-5xl" />       
            <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center opacity-20" />   
            <div className="flex justify-center items-center h-screen w-full">
                {/* <Card className="bg-black/30 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 p-4  border-none"> */}
                    <IndividualPractice />
                {/* </Card> */}
            </div>
        </div>
    );
}
