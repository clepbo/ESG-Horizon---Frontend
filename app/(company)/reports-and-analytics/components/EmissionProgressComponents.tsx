import { GoDotFill } from "react-icons/go";
import { CustomProgress } from "./charts/ProgressBar";

interface Props {
    value: number;
    title: string;
    total: number;
    percent: number


}
interface EmissionProps {
    data: Props[]
    title: string,
    total: number
    color: string
}

export default function EmissionProgressComponent({data, title, color, total}: EmissionProps) {
  return (
    <div className="grid gap-3">
        <div className={`flex gap-2 justify-start items-center w-full `}>

        <GoDotFill className={`h-6 text-${color} rounded-full`}/>
        <h5 className={`text-${color}`}> {title} ({`${total}`}tCO<sub>2</sub>e) </h5>
        </div>
        {
            data.map((item, i) => (
                <CustomProgress value={item.value} title={item.title} total={item.total} percent={item.percent}
                key={i}
                />
            ))
        }
        
        
        
    </div>
  )
}