export class CreateAssetDto {
  assetTag: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
}