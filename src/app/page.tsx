import BusStopMap from "@/components/BusStopMap";
import { promises as fs } from 'fs';


export default async function Home() {
  const file = await fs.readFile("src/data/la-rochelle-bus.geojson", "utf-8");
  const busData = JSON.parse(file) as { features: Feature[] };
  return (
    <BusStopMap json={busData} />
  );
}