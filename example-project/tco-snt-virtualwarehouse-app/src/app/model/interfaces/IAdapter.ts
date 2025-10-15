export interface IAdapter<Destination, Source> {
    adapt(item: Source): Destination;
}