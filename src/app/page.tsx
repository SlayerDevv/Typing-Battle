
import RoomsPage from "@/pages/Rooms";
import { ChevronRight } from "lucide-react";
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
 return(
  <div className="">
    <RoomsPage />
     <Toaster/>
  </div>
 )
 
}