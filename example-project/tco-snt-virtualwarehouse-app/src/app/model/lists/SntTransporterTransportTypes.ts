import { SntTransporterTransportType } from "src/app/api/GCPClient";
import { SelectedView } from "../interfaces/ISelectedView";

export const SntTransporterTransportTypes: SelectedView[] = [
  { value: SntTransporterTransportType.AUTOMOBILE, viewValue: 'Автомобильный' },
  { value: SntTransporterTransportType.RAILWAY, viewValue: 'Железнодорожный' },
  { value: SntTransporterTransportType.AIR, viewValue: 'Воздушный' },
  { value: SntTransporterTransportType.MARINE, viewValue: 'Морской или внутренний вводный' },
  { value: SntTransporterTransportType.PIPELINE, viewValue: 'Трубопровод' },
  { value: SntTransporterTransportType.MULTIMODAL, viewValue: 'Мультимодальный' }
];
