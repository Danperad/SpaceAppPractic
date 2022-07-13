export default interface ResultModel {
  date_time_stamp: string,
  resolution: number,
  circuit_number: number,
  cloudiness: number,
  platform_type_identifier: string,
  id: number,
  platform_name: string,
  previews: {
    url: string,
    geometry: string
  }[]
}